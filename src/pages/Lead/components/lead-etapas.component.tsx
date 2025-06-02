import { Lead, LeadHistory } from '../../../models';

interface Props {
  lead: Lead;
}
export const LeadEtapasComponent = (props: Props) => {
  return (
    <div className="list-etapas">
      {props.lead.state_histories?.map((history: LeadHistory, index: number) => (
        <button
          key={index}
          className={`button__stage ${
            props.lead.lead_state_id == String(history.id) ? 'button__stage--current' : ''
          }`}
        >
          {history.name.charAt(0).toUpperCase() + history.name.slice(1).toLowerCase()}:{' '}
          {history.value} días
        </button>
      ))}
    </div>
  );
};

export default LeadEtapasComponent;
