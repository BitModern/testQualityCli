/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

export const MilestoneRoute = () => `/milestone`;
export const MilestoneLabelAssignedRoute = (milestone_id: number) =>
  `/milestone/${milestone_id}/label_assigned`;
export const MilestoneCommentRoute = (milestone_id: number) =>
  `/milestone/${milestone_id}/comment`;
export const MilestoneTargetRoute = (milestone_id: number) =>
  `/milestone/${milestone_id}/target`;
export const MilestoneRunRoute = (milestone_id: number) =>
  `/milestone/${milestone_id}/run`;
export const RunRoute = () => `/run`;
export const RunLabelAssignedRoute = (run_id: number) =>
  `/run/${run_id}/label_assigned`;
export const RunRunResultRoute = (run_id: number) =>
  `/run/${run_id}/run_result`;
export const RunCommentRoute = (run_id: number) => `/run/${run_id}/comment`;
export const AccessRoleRoute = () => `/access_role`;
export const AccessRolePolicyRoute = (access_role_id: number) =>
  `/access_role/${access_role_id}/policy`;
export const AccessRoleProjectRoute = (access_role_id: number) =>
  `/access_role/${access_role_id}/project`;
export const AccessRoleUserRoute = (access_role_id: number) =>
  `/access_role/${access_role_id}/user`;
export const PolicyRoute = () => `/policy`;
export const PolicyPolicyRowsRoute = (policy_id: number) =>
  `/policy/${policy_id}/policy_rows`;
export const AttachmentRoute = () => `/attachment`;
export const IntegrationRoute = () => `/integration`;
export const IntegrationUserRoute = (integration_id: number) =>
  `/integration/${integration_id}/user`;
export const IntegrationCapabilityRoute = (integration_id: number) =>
  `/integration/${integration_id}/capability`;
export const IntegrationProjectRoute = (integration_id: number) =>
  `/integration/${integration_id}/project`;
export const DefectRoute = () => `/defect`;
export const VirtualRoute = () => `/virtual`;
export const RequirementRoute = () => `/requirement`;
export const PurposeRoute = () => `/purpose`;
export const PurposeLabelAssignedRoute = (purpose_id: number) =>
  `/purpose/${purpose_id}/label_assigned`;
export const PurposePlanRoute = (purpose_id: number) =>
  `/purpose/${purpose_id}/plan`;
export const CommentRoute = () => `/comment`;
export const LabelAssignedRoute = () => `/label_assigned`;
export const LabelRoute = () => `/label`;
export const LabelLabelAssignedRoute = (label_id: number) =>
  `/label/${label_id}/label_assigned`;
export const DefectStatusRoute = () => `/defect_status`;
export const DefectStatusDefectRoute = (defect_status_id: number) =>
  `/defect_status/${defect_status_id}/defect`;
export const DefectStatusNativeDefectStatusRoute = (defect_status_id: number) =>
  `/defect_status/${defect_status_id}/native_defect_status`;
export const DefectResRoute = () => `/defect_res`;
export const DefectResNativeDefectResRoute = (defect_res_id: number) =>
  `/defect_res/${defect_res_id}/native_defect_res`;
export const DefectResDefectRoute = (defect_res_id: number) =>
  `/defect_res/${defect_res_id}/defect`;
export const TestQualityRoute = () => `/test_quality`;
export const TestQualityLabelAssignedRoute = (test_quality_id: number) =>
  `/test_quality/${test_quality_id}/label_assigned`;
export const TestQualityTestRoute = (test_quality_id: number) =>
  `/test_quality/${test_quality_id}/test`;
export const TestQualityTypeRoute = () => `/test_quality_type`;
export const TestQualityTypeLabelAssignedRoute = (
  test_quality_type_id: number
) => `/test_quality_type/${test_quality_type_id}/label_assigned`;
export const TestQualityTypeTestQualityRoute = (test_quality_type_id: number) =>
  `/test_quality_type/${test_quality_type_id}/test_quality`;
export const NativeDefectResRoute = () => `/native_defect_res`;
export const NativeDefectResLabelAssignedRoute = (
  native_defect_res_id: number
) => `/native_defect_res/${native_defect_res_id}/label_assigned`;
export const NativeDefectResDefectResRoute = (native_defect_res_id: number) =>
  `/native_defect_res/${native_defect_res_id}/defect_res`;
export const NativeDefectStatusRoute = () => `/native_defect_status`;
export const NativeDefectStatusLabelAssignedRoute = (
  native_defect_status_id: number
) => `/native_defect_status/${native_defect_status_id}/label_assigned`;
export const NativeDefectStatusDefectStatusRoute = (
  native_defect_status_id: number
) => `/native_defect_status/${native_defect_status_id}/defect_status`;
export const NotificationsRoute = () => `/notifications`;
export const SuiteRoute = () => `/suite`;
export const SuiteLabelAssignedRoute = (suite_id: number) =>
  `/suite/${suite_id}/label_assigned`;
export const SuiteTestRoute = (suite_id: number) => `/suite/${suite_id}/test`;
export const SuitePlanRoute = (suite_id: number) => `/suite/${suite_id}/plan`;
export const SuiteRunResultRoute = (suite_id: number) =>
  `/suite/${suite_id}/run_result`;
export const SuiteCommentRoute = (suite_id: number) =>
  `/suite/${suite_id}/comment`;
export const SuiteWatchRoute = (suite_id: number) => `/suite/${suite_id}/watch`;
export const SuitePlanSuiteTestIncludeRoute = (suite_id: number) =>
  `/suite/${suite_id}/plan_suite_test_include`;
export const TestRoute = () => `/test`;
export const TestLabelAssignedRoute = (test_id: number) =>
  `/test/${test_id}/label_assigned`;
export const TestSuiteRoute = (test_id: number) => `/test/${test_id}/suite`;
export const TestRunResultRoute = (test_id: number) =>
  `/test/${test_id}/run_result`;
export const TestStepRoute = (test_id: number) => `/test/${test_id}/step`;
export const TestRequirementRoute = (test_id: number) =>
  `/test/${test_id}/requirement`;
export const TestAttachmentRoute = (test_id: number) =>
  `/test/${test_id}/attachment`;
export const TestCommentRoute = (test_id: number) => `/test/${test_id}/comment`;
export const TestWatchRoute = (test_id: number) => `/test/${test_id}/watch`;
export const TestCodeRoute = (test_id: number) => `/test/${test_id}/code`;
export const TestPlanSuiteTestIncludeRoute = (test_id: number) =>
  `/test/${test_id}/plan_suite_test_include`;
export const ProjectRoute = () => `/project`;
export const ProjectLabelAssignedRoute = (project_id: number) =>
  `/project/${project_id}/label_assigned`;
export const ProjectPlanRoute = (project_id: number) =>
  `/project/${project_id}/plan`;
export const ProjectSuiteRoute = (project_id: number) =>
  `/project/${project_id}/suite`;
export const ProjectTestRoute = (project_id: number) =>
  `/project/${project_id}/test`;
export const ProjectMilestoneRoute = (project_id: number) =>
  `/project/${project_id}/milestone`;
export const ProjectStepRoute = (project_id: number) =>
  `/project/${project_id}/step`;
export const ProjectRunResultRoute = (project_id: number) =>
  `/project/${project_id}/run_result`;
export const ProjectRunResultStepRoute = (project_id: number) =>
  `/project/${project_id}/run_result_step`;
export const ProjectRunRoute = (project_id: number) =>
  `/project/${project_id}/run`;
export const ProjectIntegrationRoute = (project_id: number) =>
  `/project/${project_id}/integration`;
export const ProjectCommentRoute = (project_id: number) =>
  `/project/${project_id}/comment`;
export const ProjectWatchRoute = (project_id: number) =>
  `/project/${project_id}/watch`;
export const ProjectProjectCapabilityDefaultRoute = (project_id: number) =>
  `/project/${project_id}/project_capability_default`;
export const ProjectDefectRoute = (project_id: number) =>
  `/project/${project_id}/defect`;
export const ProjectRequirementRoute = (project_id: number) =>
  `/project/${project_id}/requirement`;
export const ProjectTaskRoute = (project_id: number) =>
  `/project/${project_id}/task`;
export const ProjectTargetRoute = (project_id: number) =>
  `/project/${project_id}/target`;
export const ProjectCodeRoute = (project_id: number) =>
  `/project/${project_id}/code`;
export const ProjectAttachmentRoute = (project_id: number) =>
  `/project/${project_id}/attachment`;
export const ProjectPlanSuiteTestIncludeRoute = (project_id: number) =>
  `/project/${project_id}/plan_suite_test_include`;
export const ClientRoute = () => `/client`;
export const ClientVirtualRoute = (client_id: number) =>
  `/client/${client_id}/virtual`;
export const ClientKeyRoute = (client_id: number) => `/client/${client_id}/key`;
export const CaseTypeRoute = () => `/case_type`;
export const CaseTypeLabelAssignedRoute = (case_type_id: number) =>
  `/case_type/${case_type_id}/label_assigned`;
export const CaseTypeTestRoute = (case_type_id: number) =>
  `/case_type/${case_type_id}/test`;
export const CasePriorityRoute = () => `/case_priority`;
export const CasePriorityLabelAssignedRoute = (case_priority_id: number) =>
  `/case_priority/${case_priority_id}/label_assigned`;
export const CasePriorityTestRoute = (case_priority_id: number) =>
  `/case_priority/${case_priority_id}/test`;
export const UserRoute = () => `/user`;
export const UserAccessRoleRoute = (user_id: number) =>
  `/user/${user_id}/access_role`;
export const UserIntegrationRoute = (user_id: number) =>
  `/user/${user_id}/integration`;
export const UserSubscriptionsRoute = (user_id: number) =>
  `/user/${user_id}/subscriptions`;
export const UserSubscriptionUserRoute = (user_id: number) =>
  `/user/${user_id}/subscription_user`;
export const UserQuoteRoute = (user_id: number) => `/user/${user_id}/quote`;
export const UserUserLogRoute = (user_id: number) =>
  `/user/${user_id}/user_log`;
export const UserNotificationsRoute = (user_id: number) =>
  `/user/${user_id}/notifications`;
export const UserExportRoute = (user_id: number) => `/user/${user_id}/export`;
export const UserReportRoute = (user_id: number) => `/user/${user_id}/report`;
export const UserFeatureUserRoute = (user_id: number) =>
  `/user/${user_id}/feature_user`;
export const UserSupportRoute = (user_id: number) => `/user/${user_id}/support`;
export const UserSupportAgentRoute = (user_id: number) =>
  `/user/${user_id}/support_agent`;
export const UserBillingContactRoute = (user_id: number) =>
  `/user/${user_id}/billing_contact`;
export const PlanRoute = () => `/plan`;
export const PlanLabelAssignedRoute = (plan_id: number) =>
  `/plan/${plan_id}/label_assigned`;
export const PlanSuiteRoute = (plan_id: number) => `/plan/${plan_id}/suite`;
export const PlanAppVersionPlatVersionRoute = (plan_id: number) =>
  `/plan/${plan_id}/app_version_plat_version`;
export const PlanRunRoute = (plan_id: number) => `/plan/${plan_id}/run`;
export const PlanPurposeRoute = (plan_id: number) => `/plan/${plan_id}/purpose`;
export const PlanCommentRoute = (plan_id: number) => `/plan/${plan_id}/comment`;
export const PlanWatchRoute = (plan_id: number) => `/plan/${plan_id}/watch`;
export const PlanAttachmentRoute = (plan_id: number) =>
  `/plan/${plan_id}/attachment`;
export const PlanPlanSuiteTestIncludeRoute = (plan_id: number) =>
  `/plan/${plan_id}/plan_suite_test_include`;
export const RunResultRoute = () => `/run_result`;
export const RunResultLabelAssignedRoute = (run_result_id: number) =>
  `/run_result/${run_result_id}/label_assigned`;
export const RunResultRunResultStepRoute = (run_result_id: number) =>
  `/run_result/${run_result_id}/run_result_step`;
export const RunResultAttachmentRoute = (run_result_id: number) =>
  `/run_result/${run_result_id}/attachment`;
export const RunResultCommentRoute = (run_result_id: number) =>
  `/run_result/${run_result_id}/comment`;
export const RunResultDefectRoute = (run_result_id: number) =>
  `/run_result/${run_result_id}/defect`;
export const StepRoute = () => `/step`;
export const StepLabelAssignedRoute = (step_id: number) =>
  `/step/${step_id}/label_assigned`;
export const StepRunResultStepRoute = (step_id: number) =>
  `/step/${step_id}/run_result_step`;
export const StepCommentRoute = (step_id: number) => `/step/${step_id}/comment`;
export const RunResultStepRoute = () => `/run_result_step`;
export const RunResultStepLabelAssignedRoute = (run_result_step_id: number) =>
  `/run_result_step/${run_result_step_id}/label_assigned`;
export const RunResultStepAttachmentRoute = (run_result_step_id: number) =>
  `/run_result_step/${run_result_step_id}/attachment`;
export const RunResultStepCommentRoute = (run_result_step_id: number) =>
  `/run_result_step/${run_result_step_id}/comment`;
export const StatusRoute = () => `/status`;
export const StatusLabelAssignedRoute = (status_id: number) =>
  `/status/${status_id}/label_assigned`;
export const StatusRunResultStepRoute = (status_id: number) =>
  `/status/${status_id}/run_result_step`;
export const StatusRunResultRoute = (status_id: number) =>
  `/status/${status_id}/run_result`;
export const PlanSuiteTestIncludeRoute = () => `/plan_suite_test_include`;
