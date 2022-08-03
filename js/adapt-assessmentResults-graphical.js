import components from 'core/js/components';
import AssessmentResultsGraphicalView from './assessmentResultsGraphicalView';
import AssessmentResultsGraphicalModel from './assessmentResultsGraphicalModel';

export default components.register('assessmentResults-graphical', {
  // create a new class in the inheritance chain so it can be extended per component type if necessary later
  model: AssessmentResultsGraphicalModel, //ComponentModel.extend({}),
  view: AssessmentResultsGraphicalView
});
