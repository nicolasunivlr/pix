const { expect, databaseBuilder } = require('../../../test-helper');
const campaignParticipantActivityRepository = require('../../../../lib/infrastructure/repositories/campaign-participant-activity-repository');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CampaignParticipantActivity = require('../../../../lib/domain/read-models/CampaignParticipantActivity');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const Campaign = require('../../../../lib/domain/models/Campaign');

describe('Integration | Repository | Campaign Participant activity', () => {

  describe('#findPaginatedByCampaignId', () => {
    let campaign;

    context('When there is an assessment for another campaign', () => {
      beforeEach(async () => {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});
        const otherCampaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildAssessmentFromParticipation({
          participantExternalId: 'The good',
          campaignId: campaign.id,
        });

        databaseBuilder.factory.buildAssessmentFromParticipation({
          participantExternalId: 'The bad',
          campaignId: otherCampaign.id,
        });

        databaseBuilder.factory.buildAssessmentFromParticipation({
          participantExternalId: 'The ugly',
          campaignId: campaign.id,
        });

        await databaseBuilder.commit();
      });

      it('Returns a participation activity for each participant of the given campaign', async () => {
        const { campaignParticipantsActivities } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const participantExternalIds = campaignParticipantsActivities.map((activity) => activity.participantExternalId);

        expect(participantExternalIds).to.exactlyContain(['The good', 'The ugly']);
      });
    });

    context('When there are several participations for the same participant', () => {

      it('Returns one CampaignParticipantActivity with the most recent participation (isImproved = false)', async () => {
        //Given
        const campaign = databaseBuilder.factory.buildAssessmentCampaign({});
        const user = databaseBuilder.factory.buildUser();

        databaseBuilder.factory.buildAssessmentFromParticipation({
          participantExternalId: 'The bad',
          campaignId: campaign.id,
          isShared: false,
          userId: user.id,
          isImproved: true,
        });

        databaseBuilder.factory.buildAssessmentFromParticipation({
          participantExternalId: 'The good',
          campaignId: campaign.id,
          isShared: false,
          userId: user.id,
          isImproved: false,
        });

        await databaseBuilder.commit();

        //when
        const { campaignParticipantsActivities } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });

        //then
        expect(campaignParticipantsActivities).to.have.lengthOf(1);
        expect(campaignParticipantsActivities[0].participantExternalId).to.equal('The good');
      });
    });

    context('when the campaign is assessment', () => {

      context('When there are several assessments for the same participant', () => {

        beforeEach(async () => {
          campaign = databaseBuilder.factory.buildAssessmentCampaign({});
          const user = databaseBuilder.factory.buildUser();
          const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            isShared: false,
            userId: user.id,
          });

          databaseBuilder.factory.buildAssessment({
            campaignParticipationId: campaignParticipation.id,
            createdAt: new Date(2020, 1, 1),
            state: Assessment.states.COMPLETED,
            userId: user.id,
          });

          databaseBuilder.factory.buildAssessment({
            campaignParticipationId: campaignParticipation.id,
            createdAt: new Date(2020, 1, 2),
            state: Assessment.states.STARTED,
            userId: user.id,
          });

          await databaseBuilder.commit();
        });

        it('Returns one CampaignParticipantActivity with the most recent assessment', async () => {
          const { campaignParticipantsActivities } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
          const statuses = campaignParticipantsActivities.map((activity) => activity.status);

          expect(statuses).to.have.lengthOf(1);
          expect(statuses).to.exactlyContain([CampaignParticipantActivity.statuses.STARTED]);
        });
      });

      context('progression', () => {
        context('when the participation is not shared', () => {
          context('when the participant has only one knowledgeElement by skill', () => {
            beforeEach(async () => {
              campaign = databaseBuilder.factory.buildAssessmentCampaign({}, [{ id: 'skillValidated' }, { id: 'skillInvalidated' }, { id: 'skillReset' }]);
              const { id: participantId } = databaseBuilder.factory.buildUser();
              const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
                campaignId: campaign.id,
                isShared: false,
                userId: participantId,
              });
              databaseBuilder.factory.buildAssessment({
                campaignParticipationId,
                state: Assessment.states.STARTED,
                userId: participantId,
              });
              databaseBuilder.factory.buildKnowledgeElement({ userId: participantId, skillId: 'skillValidated', status: KnowledgeElement.StatusType.VALIDATED });
              databaseBuilder.factory.buildKnowledgeElement({ userId: participantId, skillId: 'skillInvalidated', status: KnowledgeElement.StatusType.INVALIDATED });
              databaseBuilder.factory.buildKnowledgeElement({ userId: participantId, skillId: 'skillReset', status: KnowledgeElement.StatusType.RESET });

              await databaseBuilder.commit();
            });

            it('computes the participation progression counting knowledge elements evaluated', async () => {
              const { campaignParticipantsActivities } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
              expect(campaignParticipantsActivities[0].progression).to.equal(2 / 3);
            });
          });

          context('when the participant has several knowledgeElements by skill', () => {
            beforeEach(async () => {
              campaign = databaseBuilder.factory.buildAssessmentCampaign({}, [{ id: 'skill' }]);
              const { id: participantId } = databaseBuilder.factory.buildUser();
              const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
                campaignId: campaign.id,
                isShared: false,
                userId: participantId,
              });
              databaseBuilder.factory.buildAssessment({
                campaignParticipationId,
                state: Assessment.states.STARTED,
                userId: participantId,
              });
              databaseBuilder.factory.buildKnowledgeElement({ userId: participantId, skillId: 'skill', status: KnowledgeElement.StatusType.VALIDATED, createdAt: new Date('2020-01-01') });
              databaseBuilder.factory.buildKnowledgeElement({ userId: participantId, skillId: 'skill', status: KnowledgeElement.StatusType.RESET, createdAt: new Date('2020-01-02') });

              await databaseBuilder.commit();
            });

            it('computes the participation progression using the most recent knowledge elements by skill', async () => {
              const { campaignParticipantsActivities } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
              expect(campaignParticipantsActivities[0].progression).to.equal(0);
            });
          });
        });

        context('when the participation is shared', () => {
          beforeEach(async () => {
            campaign = databaseBuilder.factory.buildAssessmentCampaign({}, [{ id: 'skillValidated' }, { id: 'skillInvalidated' }, { id: 'skillReset' }]);
            const { id: participantId } = databaseBuilder.factory.buildUser();
            const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
              campaignId: campaign.id,
              isShared: true,
              userId: participantId,
            });
            databaseBuilder.factory.buildAssessment({
              campaignParticipationId,
              state: Assessment.states.STARTED,
              userId: participantId,
            });

            await databaseBuilder.commit();
          });

          it('returns 1', async () => {
            const { campaignParticipantsActivities } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
            expect(campaignParticipantsActivities[0].progression).to.equal(1);
          });
        });
      });
    });

    context('when the campaign is profile collection', () => {
      context('when the participation is shared', () => {
        it('should return status shared', async () => {
          campaign = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id, isShared: true });
          await databaseBuilder.commit();

          const { campaignParticipantsActivities } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
          expect(campaignParticipantsActivities[0].status).to.equal(CampaignParticipantActivity.statuses.SHARED);
        });
      });

      context('when the participation is not shared', () => {
        it('should return status completed', async () => {
          campaign = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id, isShared: false });
          await databaseBuilder.commit();

          const { campaignParticipantsActivities } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
          expect(campaignParticipantsActivities[0].status).to.equal(CampaignParticipantActivity.statuses.COMPLETED);
        });
      });

      context('progression', () => {
        it('should not be defined', async () => {
          campaign = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id, isShared: false });
          await databaseBuilder.commit();

          const { campaignParticipantsActivities } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
          expect(campaignParticipantsActivities[0].progression).to.equal(undefined);
        });
      });
    });

    context('order', () => {
      it('should return participants activities ordered by last name then first name asc (including schooling registration data)', async () => {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        campaign = databaseBuilder.factory.buildAssessmentCampaign({ organizationId });
        const campaignParticipation = { campaignId: campaign.id };
        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ firstName: 'Jaja', lastName: 'Le raplapla', organizationId }, campaignParticipation, true);
        databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'jiji', lastName: 'Le riquiqui', organizationId }, campaignParticipation, true);
        databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Jojo', lastName: 'Le rococo', organizationId }, campaignParticipation, true);
        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ firstName: 'Juju', lastName: 'Le riquiqui', organizationId }, campaignParticipation, true);

        await databaseBuilder.commit();

        // when
        const { campaignParticipantsActivities } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const names = campaignParticipantsActivities.map((result) => result.firstName);

        // then
        expect(names).exactlyContainInOrder(['Jaja', 'jiji', 'Juju', 'Jojo']);
      });
    });

    context('pagination', () => {

      beforeEach(async () => {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});

        const participation = { campaignId: campaign.id };
        databaseBuilder.factory.buildAssessmentFromParticipation(participation);
        databaseBuilder.factory.buildAssessmentFromParticipation(participation);

        await databaseBuilder.commit();
      });

      it('should return paginated campaign participations based on the given size and number', async () => {
        const page = { size: 1, number: 1 };

        const { campaignParticipantsActivities, pagination } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id, page });

        expect(campaignParticipantsActivities).to.have.lengthOf(1);
        expect(pagination).to.deep.equals({ page: 1, pageCount: 2, pageSize: 1, rowCount: 2 });
      });

      context('default pagination', () => {

        it('should return a page size of 25', async () => {

          const { pagination } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });

          expect(pagination.pageSize).to.equals(25);

        });
      });

      context('when there are zero rows', () => {
        beforeEach(async () => {
          campaign = databaseBuilder.factory.buildAssessmentCampaign({});

          await databaseBuilder.commit();
        });

        it('should return the first page with 0 elements', async () => {

          const { campaignParticipantsActivities, pagination } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });

          expect(campaignParticipantsActivities).to.have.lengthOf(0);
          expect(pagination).to.deep.equals({ page: 1, pageCount: 0, pageSize: 25, rowCount: 0 });

        });
      });
    });
  });
});
