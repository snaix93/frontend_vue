export default ({ $auth }, inject) => {
  if (! $auth.loggedIn) return;

  inject('userSettings', $auth.user.settings);
  inject('teamSettings', $auth.team.settings);
}
