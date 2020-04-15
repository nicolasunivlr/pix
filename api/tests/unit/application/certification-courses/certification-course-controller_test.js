const { sinon, expect, hFake, generateValidRequestAuthorizationHeader } = require('$root/tests/test-helper');
const Hapi = require('@hapi/hapi');
const certificationCourseController = require('$root/lib/application/certification-courses/certification-course-controller');
const certificationService = require('$root/lib/domain/services/certification-service');
const certificationCourseService = require('$root/lib/domain/services/certification-course-service');
const certificationSerializer = require('$root/lib/infrastructure/serializers/jsonapi/certification-serializer');
const usecases = require('$root/lib/domain/usecases');
const certificationCourseSerializer = require('$root/lib/infrastructure/serializers/jsonapi/certification-course-serializer');

const CertificationCourse = require('$root/lib/domain/models/CertificationCourse');
const Assessment = require('$root/lib/domain/models/Assessment');

describe('Unit | Controller | certification-course-controller', () => {

  describe('#computeResult', () => {

    const certificationCourseId = 1245;
    const certificationScore = 156;

    const request = {
      params: {
        id: certificationCourseId
      },
      route: {
        path: '/certification'
      }
    };

    beforeEach(() => {
      sinon.stub(certificationService, 'calculateCertificationResultByCertificationCourseId').resolves(certificationScore);
    });

    it('should call certification Service to compute score', async () => {
      // when
      await certificationCourseController.computeResult(request, hFake);

      // then
      sinon.assert.calledOnce(certificationService.calculateCertificationResultByCertificationCourseId);
      sinon.assert.calledWith(certificationService.calculateCertificationResultByCertificationCourseId, certificationCourseId);
    });

    it('should reply the score', async () => {
      // when
      const response = await certificationCourseController.computeResult(request, hFake);

      // then
      expect(response).to.equal(certificationScore);
    });
  });

  describe('#getResult', () => {
    const certificationCourseId = 1;
    const request = {
      params: {
        id: certificationCourseId
      }
    };

    beforeEach(() => {
      sinon.stub(certificationService, 'getCertificationResult').resolves({});
    });

    it('should call certification-service to get certification result from database', async () => {
      // when
      await certificationCourseController.getResult(request, hFake);

      // then
      sinon.assert.calledOnce(certificationService.getCertificationResult);
      sinon.assert.calledWith(certificationService.getCertificationResult, certificationCourseId);
    });
  });

  describe('#update', () => {

    const updatedCertificationCourse = new CertificationCourse();

    const JsonAPISavedCertification = {
      data: {
        type: Assessment.types.CERTIFICATION,
        attributes: {
          id: '1',
          firstName: 'Phil',
          status: 'rejected'
        }
      }
    };

    beforeEach(() => {
      sinon.stub(certificationSerializer, 'deserialize').resolves();
      sinon.stub(certificationSerializer, 'serializeFromCertificationCourse').returns(JsonAPISavedCertification);
    });

    const options = {
      method: 'PATCH', url: '/api/certification-courses/1245', payload: {
        data: {
          type: 'certifications',
          attributes: {
            id: '1',
            firstName: 'Phil',
            status: 'rejected'
          }
        }
      }
    };

    it('should deserialize the request payload', async () => {
      // given
      sinon.stub(certificationCourseService, 'update').resolves(updatedCertificationCourse);

      // when
      await certificationCourseController.update(options, hFake);

      // then
      sinon.assert.calledOnce(certificationSerializer.deserialize);
    });

    it('should patch certificationCourse data using save method', async () => {
      // given
      sinon.stub(certificationCourseService, 'update').resolves(updatedCertificationCourse);

      // when
      await certificationCourseController.update(options, hFake);

      // then
      sinon.assert.calledOnce(certificationCourseService.update);
    });

    context('when certification course was modified', () => {

      beforeEach(() => {
        sinon.stub(certificationCourseService, 'update').resolves(updatedCertificationCourse);
      });

      it('should serialize saved certification course', async () => {
        // when
        await certificationCourseController.update(options, hFake);

        // then
        sinon.assert.calledOnce(certificationSerializer.serializeFromCertificationCourse);
        sinon.assert.calledWith(certificationSerializer.serializeFromCertificationCourse, updatedCertificationCourse);
      });

      it('should reply serialized certification course', async () => {
        // when
        const response = await certificationCourseController.update(options, hFake);

        // then
        expect(response).to.deep.equal(JsonAPISavedCertification);
      });
    });
  });

  describe('#save', () => {

    let server;
    let request;

    beforeEach(() => {
      request = {
        auth: { credentials: { accessToken: 'jwt.access.token', userId: 'userId' } },
        pre: { userId: 'userId' },
        payload: {
          data: {
            attributes: {
              'access-code': 'ABCD12',
              'session-id': '12345',
            },
          }
        }
      };
      sinon.stub(usecases, 'retrieveLastOrCreateCertificationCourse');
      sinon.stub(certificationCourseSerializer, 'serialize');

      server = this.server = Hapi.server();
      return server.register(require('$root/lib/application/certification-courses'));
    });

    context('when certification course needs to be created', function() {
      const newlyCreatedCertificationCourse = { id: 'CertificationCourseId', nbChallenges: 3 };

      it('should call the use case with the right arguments', async () => {
        // given
        usecases.retrieveLastOrCreateCertificationCourse
          .withArgs({ sessionId: '12345', accessCode: 'ABCD12', userId: 'userId' })
          .resolves({ created: true, certificationCourse: newlyCreatedCertificationCourse });

        // when
        await certificationCourseController.save(request, hFake);

        // then
        sinon.assert.calledWith(usecases.retrieveLastOrCreateCertificationCourse, {
          sessionId: '12345',
          accessCode: 'ABCD12',
          userId: 'userId',
        });
      });

      it('should reply the certification course serialized', async () => {
        // given
        const serializedCertificationCourse = Symbol('a serialized certification course');
        usecases.retrieveLastOrCreateCertificationCourse
          .withArgs({ sessionId: '12345', accessCode: 'ABCD12', userId: 'userId' })
          .resolves({ created: true, certificationCourse: newlyCreatedCertificationCourse });
        certificationCourseSerializer.serialize.resolves(serializedCertificationCourse);

        // when
        const response = await certificationCourseController.save(request, hFake);

        // then
        expect(response.source).to.equal(serializedCertificationCourse);
        expect(response.statusCode).to.equal(201);
      });
    });

    context('when certification course already exists', function() {
      it('should reply the existing certification course', async () => {
        // given
        const existingCertificationCourse = { id: 'CertificationCourseId', nbChallenges: 3 };

        usecases.retrieveLastOrCreateCertificationCourse
          .withArgs({ sessionId: '12345', accessCode: 'ABCD12', userId: 'userId' })
          .resolves({ created: false, certificationCourse: existingCertificationCourse });
        certificationCourseSerializer.serialize.resolves({});

        // when
        await certificationCourseController.save(request, hFake);

        // then
        sinon.assert.calledWith(certificationCourseSerializer.serialize, existingCertificationCourse);
      });

    });
  });

  describe('#get', () => {

    let certificationCourse;
    const certificationCourseId = 'certification_course_id';

    beforeEach(() => {
      certificationCourse = new CertificationCourse({ 'id': certificationCourseId });
    });

    it('should fetch and return the given course, serialized as JSONAPI', async () => {
      // given
      const userId = 42;
      sinon.stub(usecases, 'getCertificationCourse')
        .withArgs({ userId, certificationCourseId })
        .resolves(certificationCourse);
      sinon.stub(certificationCourseSerializer, 'serialize')
        .withArgs(certificationCourse)
        .resolves(certificationCourse);
      const request = {
        params: { id: certificationCourseId },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        auth: { credentials: { userId } },
      };

      // when
      const response = await certificationCourseController.get(request, hFake);

      // then
      expect(response).to.deep.equal(certificationCourse);
    });
  });
});
