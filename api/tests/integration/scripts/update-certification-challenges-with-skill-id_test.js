const _ = require('lodash');
const AirtableRecord = require('airtable').Record;

const { expect, databaseBuilder, sinon, knex } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');
const airtable = require('../../../lib/infrastructure/airtable');
const makeAirtableFake = require('../../tooling/airtable-builder/make-airtable-fake');

const {
  getDistinctAssociatedSkillNamesForNullSkillId,
  mapSkillNamesWithId,
  updateAllAssociatedSkillId,
} = require('../../../scripts/update-certification-challenges-with-skill-id');

describe('Integration | Scripts | update-certification-challenges-with-skill-id.js', () => {
  const skillNames = ['@skill1', '@skill2', '@skill3'];

  beforeEach(() => {
    sinon.stub(cache, 'get').callsFake((key, generator) => generator());
  });

  describe('#getDistinctAssociatedSkillsForNullSkillId', () => {

    beforeEach(() => {
      _.each(skillNames, (skillName) => {
        databaseBuilder.factory.buildCertificationChallenge({ associatedSkillName: skillName, associatedSkillId: null });
        databaseBuilder.factory.buildCertificationChallenge({ associatedSkillName: skillName, associatedSkillId: null });
      });
      databaseBuilder.factory.buildCertificationChallenge({ associatedSkillName: 'someName', associatedSkillId: 'someId' });
      return databaseBuilder.commit();
    });

    it('should get the list of distinct associatedSkill values in table certification-challenges exclusively from records where skillid is null', async () => {
      // when
      const actualDistinctAssociatedSkills = await getDistinctAssociatedSkillNamesForNullSkillId();

      // then
      expect(actualDistinctAssociatedSkills).to.include.deep.members(skillNames);
      expect(actualDistinctAssociatedSkills.length).to.equal(skillNames.length);
    });
  });

  describe('#mapAssociatedSkillNameWithId', () => {

    beforeEach(() => {
      const acquix1 = new AirtableRecord('Acquis', 'recAcquix1', {
        fields: {
          'id persistant': 'recAcquix1',
          'Nom': '@skill1',
        }
      });
      const acquix2 = new AirtableRecord('Acquis', 'recAcquix2', {
        fields: {
          'id persistant': 'recAcquix2',
          'Nom': '@skill2',
        }
      });
      const acquix3 = new AirtableRecord('Acquis', 'recAcquix3', {
        fields: {
          'id persistant': 'recAcquix3',
          'Nom': '@skill3',
        }
      });
      sinon.stub(airtable, 'findRecords')
        .withArgs('Acquis')
        .callsFake(makeAirtableFake([acquix1, acquix2, acquix3]));
    });

    it('should map all skill names with their respective ID', async () => {
      // when
      const actualSkillMap = await mapSkillNamesWithId(skillNames);

      // then
      expect(actualSkillMap).to.include.deep.members([
        {
          skillName: '@skill1',
          skillId: 'recAcquix1',
        },
        {
          skillName: '@skill2',
          skillId: 'recAcquix2',
        },
        {
          skillName: '@skill3',
          skillId: 'recAcquix3',
        },
      ]);
      expect(actualSkillMap.length).to.equal(skillNames.length);
    });
  });

  describe('#updateAllAssociatedSkillId', () => {
    const skillsMap = [
      {
        skillName: skillNames[0],
        skillId: 'someId1',
      },
      {
        skillName: skillNames[1],
        skillId: 'someId2',
      },
      {
        skillName: skillNames[2],
        skillId: 'someId3',

      },
    ];

    it('should update all certification challenges with the appropriate skillId according to their associatedSkill', async () => {
      // given
      _.each(skillNames, (skillName) => {
        databaseBuilder.factory.buildCertificationChallenge({ associatedSkillName: skillName, associatedSkillId: null });
        databaseBuilder.factory.buildCertificationChallenge({ associatedSkillName: skillName, associatedSkillId: null });
      });
      await databaseBuilder.commit();
      
      // when
      await updateAllAssociatedSkillId(skillsMap);

      // then
      const resultSkill0 = await knex.raw('SELECT distinct ?? FROM ?? WHERE ?? = ?',
        ['associatedSkillId', 'certification-challenges', 'associatedSkillName', skillNames[0]]);
      const resultSkill1 = await knex.raw('SELECT distinct ?? FROM ?? WHERE ?? = ?',
        ['associatedSkillId', 'certification-challenges', 'associatedSkillName', skillNames[1]]);
      const resultSkill2 = await knex.raw('SELECT distinct ?? FROM ?? WHERE ?? = ?',
        ['associatedSkillId', 'certification-challenges', 'associatedSkillName', skillNames[2]]);
      const associatedSkillIds0 = _.map(resultSkill0.rows, 'associatedSkillId');
      const associatedSkillIds1 = _.map(resultSkill1.rows, 'associatedSkillId');
      const associatedSkillIds2 = _.map(resultSkill2.rows, 'associatedSkillId');
      expect(associatedSkillIds0).to.have.length(1);
      expect(associatedSkillIds1).to.have.length(1);
      expect(associatedSkillIds2).to.have.length(1);
      expect(associatedSkillIds0[0]).to.equal('someId1');
      expect(associatedSkillIds1[0]).to.equal('someId2');
      expect(associatedSkillIds2[0]).to.equal('someId3');
    });

    it('should avoid updating records with an already set associatedSkillId', async () => {
      // given
      _.each(skillNames, (skillName) => {
        databaseBuilder.factory.buildCertificationChallenge({ associatedSkillName: skillName, associatedSkillId: null });
        databaseBuilder.factory.buildCertificationChallenge({ associatedSkillName: skillName, associatedSkillId: 'alreadySetSkillId' });
      });
      await databaseBuilder.commit();

      // when
      await updateAllAssociatedSkillId(skillsMap);

      // then
      const resultSkill0 = await knex.raw('SELECT distinct ?? FROM ?? WHERE ?? = ?',
        ['associatedSkillId', 'certification-challenges', 'associatedSkillName', skillNames[0]]);
      const resultSkill1 = await knex.raw('SELECT distinct ?? FROM ?? WHERE ?? = ?',
        ['associatedSkillId', 'certification-challenges', 'associatedSkillName', skillNames[1]]);
      const resultSkill2 = await knex.raw('SELECT distinct ?? FROM ?? WHERE ?? = ?',
        ['associatedSkillId', 'certification-challenges', 'associatedSkillName', skillNames[2]]);
      const associatedSkillIds0 = _.map(resultSkill0.rows, 'associatedSkillId');
      const associatedSkillIds1 = _.map(resultSkill1.rows, 'associatedSkillId');
      const associatedSkillIds2 = _.map(resultSkill2.rows, 'associatedSkillId');
      expect(associatedSkillIds0).to.have.length(2);
      expect(associatedSkillIds1).to.have.length(2);
      expect(associatedSkillIds2).to.have.length(2);
      expect(associatedSkillIds0).to.include.deep.members(['someId1', 'alreadySetSkillId']);
      expect(associatedSkillIds1).to.include.deep.members(['someId2', 'alreadySetSkillId']);
      expect(associatedSkillIds2).to.include.deep.members(['someId3', 'alreadySetSkillId']);
    });
  });
});
