import UserModel from '@/models/User';
import TeamModel from '@/models/Team';

export default function ({ $axios, $auth }, inject) {
  if (! $auth.loggedIn) return;

  const hydrateAuthModels = (userData) => {
    const User = new UserModel({ ...userData });
    User.team = new TeamModel(User.team);
    return User;
  };

  const setTeamOnAuth = () => {
    if (! $auth.hasOwnProperty('team')) {
      Object.defineProperty($auth, 'team', {
        get() {
          return this.user.team;
        },
      });
    }
  };

  const hardRefreshUser = async () => {
    const { data } = await $axios.$get('/user');
    const User = hydrateAuthModels(data);

    for (let newUserProp in User) {
      if (['_settings'].includes(newUserProp)) {
        continue;
      }

      if (['dates'].includes(newUserProp)) {
        for (let newUserDateProp in User.dates) {
          $auth.user.dates[newUserDateProp] = User.dates[newUserDateProp];
        }
        continue;
      }

      if ($auth.user[newUserProp] === User[newUserProp]) {
        continue;
      }

      $auth.user[newUserProp] = User[newUserProp];
    }
  };

  const User = hydrateAuthModels($auth.user);
  $auth.setUser(User);
  setTeamOnAuth();

  inject('hardRefreshUser', hardRefreshUser);
};
