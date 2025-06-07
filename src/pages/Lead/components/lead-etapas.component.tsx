import { useSelector } from 'react-redux';
import { Lead, LeadHistory } from '../../../models';
import { AppStore } from '../../../redux/store';

export const LeadEtapasComponent = () => {
  const lead: Lead = useSelector((store: AppStore) => store.lead.lead);

  return (
    <div className="list-etapas">
      {lead.state_histories?.map((history: LeadHistory, index: number) => (
        <button
          key={index}
          className={`button__stage ${
            lead.lead_state_id == String(history.id) ? 'button__stage--current' : ''
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
