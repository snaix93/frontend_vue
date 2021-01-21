export default function ({ $auth, redirect }) {
  const User = $auth.user;

  if (! User || User.isReadOnly()) {
    redirect('/dashboard');
  }
}
