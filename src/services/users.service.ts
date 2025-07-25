import axios from 'axios';
import { UserLabel } from '../models';

export const apiUpdateUserLabels = async (
  username: string,
  labels: UserLabel[],
  isAdmin = false
) => {
  const response = await axios.put(`/api/users/${username}/labels`, {
    labels,
    isAdmin,
  });
  return response.data;
};
