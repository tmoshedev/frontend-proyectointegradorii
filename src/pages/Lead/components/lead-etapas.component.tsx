import { useSelector } from 'react-redux';
import { Lead, LeadHistory } from '../../../models';
import { AppStore } from '../../../redux/store';

export const LeadEtapasComponent = () => {
  const lead: Lead = useSelector((store: AppStore) => store.lead.lead);

  // Calcular el total de días
  const totalDias = lead.state_histories?.reduce((acc, h) => acc + (Number(h.value) || 0), 0) || 0;

  // Encontrar los días de la etapa actual
  const etapaActual = lead.state_histories?.find((h) => String(h.id) === String(lead.lead_state_id));
  const diasActual = etapaActual ? etapaActual.value : 0;

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
          {lead.lead_state_id == String(history.id) ? `${diasActual} / ${totalDias} días total` : `${history.value} / ${totalDias} días total`}
        </button>
      ))}
    </div>
  );
};

export default LeadEtapasComponent;
