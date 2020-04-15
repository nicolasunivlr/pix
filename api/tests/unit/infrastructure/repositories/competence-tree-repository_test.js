const { expect, sinon } = require('$root/tests/test-helper');
const competenceTreeRepository = require('$root/lib/infrastructure/repositories/competence-tree-repository');
const areaRepository = require('$root/lib/infrastructure/repositories/area-repository');
const CompetenceTree = require('$root/lib/domain/models/CompetenceTree');

describe('Unit | Repository | competence-tree-repository', () => {

  beforeEach(() => {
    sinon.stub(areaRepository, 'listWithPixCompetencesOnly');
  });

  describe('#get', () => {

    it('should return a the competence tree populated with Areas and Competences', () => {
      // given
      const area = {
        id: 'recvoGdo7z2z7pXWa',
        code: '1',
        name: '1. Information et données',
        title: 'Information et données',
        color: 'jaffa',
        competences: [
          {
            id: 'recsvLz0W2ShyfD63',
            name: 'Mener une recherche et une veille d’information',
          },
          {
            id: 'recNv8qhaY887jQb2',
            name: 'Mener une recherche et une veille d’information',
          },
        ],
      };

      areaRepository.listWithPixCompetencesOnly.resolves([area]);

      const expectedTree = {
        id: 1,
        areas: [
          {
            id: 'recvoGdo7z2z7pXWa',
            code: '1',
            name: '1. Information et données',
            title: 'Information et données',
            color: 'jaffa',
            competences: [
              {
                id: 'recsvLz0W2ShyfD63',
                name: 'Mener une recherche et une veille d’information',
              },
              {
                id: 'recNv8qhaY887jQb2',
                name: 'Mener une recherche et une veille d’information',
              },
            ],
          },
        ],
      };

      // when
      const promise = competenceTreeRepository.get();

      // then
      return promise.then((result) => {
        expect(result).to.be.an.instanceof(CompetenceTree);
        expect(result).to.deep.equal(expectedTree);
      });
    });
  });
});
