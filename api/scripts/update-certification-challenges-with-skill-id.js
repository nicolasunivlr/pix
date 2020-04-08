'use strict';

const _ = require('lodash');
const { knex } = require('../lib/infrastructure/bookshelf');
const skillDatasource = require('../lib/infrastructure/datasources/airtable/skill-datasource');

async function getDistinctAssociatedSkillNamesForNullSkillId() {
  const result = await knex.raw('SELECT DISTINCT ?? FROM ?? WHERE ?? IS NULL', 
    [ 'associatedSkillName',
      'certification-challenges',
      'associatedSkillId']);
  return _.map(result.rows, 'associatedSkillName');
}

async function mapSkillNamesWithId(skillNames) {
  const skillList = await skillDatasource.list();
  return _.map(skillNames, (skillName) => {
    const skill = _.find(skillList, { 'name': skillName });
    return {
      skillName,
      skillId: skill ? skill.id : null,
    };
  });
}

async function updateAllAssociatedSkillId(skillsMap) {
  try {
    await knex.transaction(async (trx) => {
      for (const { skillId, skillName } of skillsMap) {
        await trx.raw('UPDATE ?? SET ?? = ? WHERE ?? = ? AND ?? IS NULL',
          [ 'certification-challenges',
            'associatedSkillId', skillId,
            'associatedSkillName', skillName,
            'associatedSkillId' ]);
      }
    });
  } catch (error) {
    throw new Error('Error when updating associatedSkillId column');
  }
}

async function main() {
  console.log('Starting filling associatedSkillId column in certification-challenges table.');

  try {
    console.log('Fetching all distinct associatedSkills from the database...');
    const distinctAssociatedSkills = await getDistinctAssociatedSkillNamesForNullSkillId();
    console.log(`Fetch ok, ${distinctAssociatedSkills.length} values read.`);

    console.log('Mapping all associatedSkill values with their associatedSkillId...');
    const associatedSkillsMap = await mapSkillNamesWithId(distinctAssociatedSkills);
    console.log('Map ok.');

    console.log('Updating certification-challenges with adequate associatedSkillId...');
    await updateAllAssociatedSkillId(associatedSkillsMap);
    console.log('Update ok.');

  } catch (error) {
    console.error('\n', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}

module.exports = {
  getDistinctAssociatedSkillNamesForNullSkillId,
  mapSkillNamesWithId,
  updateAllAssociatedSkillId,
};
