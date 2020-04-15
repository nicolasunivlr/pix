const { sinon, expect, nock } = require('$root/tests/test-helper');
const SendinblueProvider = require('$root/lib/infrastructure/mailers/SendinblueProvider');
const mailCheck = require('$root/lib/infrastructure/mail-check');
const { mailing } = require('$root/lib/config');

describe('Unit | Class | SendinblueProvider', () => {

  beforeEach(() => {
    nock('https://api.sendinblue.com:443')
      .post('/v3/smtp/email')
      .reply();
  });

  describe('#sendEmail', () => {

    const recipient = 'test@example.net';

    context('when mail sending is enabled', () => {

      beforeEach(() => {
        sinon.stub(mailing, 'enabled').value(true);
        sinon.stub(mailing, 'provider').value('sendinblue');
      });

      context('when email check succeeds', () => {

        beforeEach(() => {
          sinon.stub(SendinblueProvider, 'createSendinblueSMTPApi');
          sinon.stub(mailCheck, 'checkMail').withArgs(recipient).resolves();
        });

        it('should call the given sendinblue api instance', async () => {
          // given
          const stubbedSibSMTPApi = { sendTransacEmail: sinon.stub() };
          SendinblueProvider.createSendinblueSMTPApi.returns(stubbedSibSMTPApi);
          const mailingProvider = new SendinblueProvider();

          const from = 'no-reply@example.net';
          const email = recipient;
          const expectedPayload = {
            to: [{
              email,
            }],
            sender: {
              name: 'Ne pas repondre',
              email: from,
            },
            subject: 'Creation de compte',
            templateId: 129291,
            headers: {
              'content-type': 'application/json',
              'accept': 'application/json',
            }
          };

          // when
          await mailingProvider.sendEmail({
            from,
            to: email,
            fromName: 'Ne pas repondre',
            subject: 'Creation de compte',
            template: '129291'
          });

          // then
          expect(stubbedSibSMTPApi.sendTransacEmail).to.have.been.calledWithExactly(expectedPayload);
        });
      });
    });
  });
});
