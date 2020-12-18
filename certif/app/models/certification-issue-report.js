import Model, { attr, belongsTo } from '@ember-data/model';

export const certificationIssueReportCategories = {
  OTHER: 'OTHER',
  CANDIDATE_INFORMATIONS_CHANGES: 'CANDIDATE_INFORMATIONS_CHANGES',
  LATE_OR_LEAVING: 'LATE_OR_LEAVING',
  CONNECTION_OR_END_SCREEN: 'CONNECTION_OR_END_SCREEN',
};

export const certificationIssueReportSubcategories = {
  NAME_OR_BIRTHDATE: 'NAME_OR_BIRTHDATE',
  EXTRA_TIME_PERCENTAGE: 'EXTRA_TIME_PERCENTAGE',
  LEFT_EXAM_ROOM: 'LEFT_EXAM_ROOM',
  SIGNATURE_ISSUE: 'SIGNATURE_ISSUE',
};

export default class CertificationIssueReport extends Model {
  @attr('string') category;
  @attr('string') subcategory;
  @attr('string') description;

  @belongsTo('certification-report') certificationReport;
}