const { expect } = require('$root/tests/test-helper');
const serializer = require('$root/lib/infrastructure/serializers/jsonapi/student-serializer');
const SchoolingRegistration = require('$root/lib/domain/models/SchoolingRegistration');

describe('Unit | Serializer | JSONAPI | student-serializer', () => {

  describe('#serialize', () => {

    it('should convert a SchoolingRegistration model object into JSON API data', () => {
      // given
      const student = new SchoolingRegistration({
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2020-01-01'
      });

      student.username = 'john.doe0101';

      const expectedSerializedStudent = {
        data: {
          type: 'students',
          id: '5',
          attributes: {
            'first-name': student.firstName,
            'last-name': student.lastName,
            'birthdate': student.birthdate,
            'username': student.username,
          }
        }
      };

      // when
      const json = serializer.serialize(student);

      // then
      expect(json).to.deep.equal(expectedSerializedStudent);
    });
  });
});
