import components from 'core/js/components';
import AssessmentResultsGraphicalView from './assessmentResultsGraphicalView';
import AssessmentResultsGraphicalModel from './assessmentResultsGraphicalModel';

export default components.register('assessmentResults-graphical', {
  model: AssessmentResultsGraphicalModel, 
  view: AssessmentResultsGraphicalView
});
