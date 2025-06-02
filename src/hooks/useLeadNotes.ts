import { useDispatch } from 'react-redux';
/**Models */
import { LeadNoteRequest } from '../models/requests';
/**Services */
import * as leadNotesService from '../services/lead-notes.service';
/**Redux */
import { setLoading } from '../redux/states/loading.slice';

export function useLeadNotes() {
  const dispatch = useDispatch();

  //POST - STORE LEAD NOTE
  const storeLeadNote = async (lead_note: LeadNoteRequest, loading: boolean) => {
    dispatch(setLoading(loading));
    try {
      const response = await leadNotesService.storeLeadNote(lead_note);
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    storeLeadNote,
  };
}
