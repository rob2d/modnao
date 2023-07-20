import { Avatar, Chip, Tooltip, Typography, styled } from '@mui/material';
//import { useSession } from 'next-auth/react';

const Styled = styled('div')(
  ({ theme }) =>
    `& {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    & > .MuiAvatar-root {
      margin-left: ${theme.spacing(2)};
    }
    `
);

function useSession() {
  return {
    data: {
      user: undefined
    }
  };
}

const AVATAR_SIZE = { width: 48, height: 48 };
export default function SessionStatusDisplay() {
  const { data: session } = useSession();
  const isLoggedIn = session?.user?.name;
  let avatarImageSrc = '/static/images/avatar/logged_out.png';

  if (isLoggedIn) {
    avatarImageSrc =
      session.user?.image || '/static/images/avatar/logged_in.webp';
  }

  return (
    <Styled>
      <Tooltip
        title={isLoggedIn ? 'Click to view session options' : 'Click to log in'}
      >
          onClick={() => undefined}
          size='medium'
          avatar={
            <Avatar
              alt={isLoggedIn ? session.user.name : 'Click to Log In'}
              src={avatarImageSrc}
              sx={AVATAR_SIZE}
            />
          }
          label={isLoggedIn ? session.user.name : 'Logged out'}
          variant='outlined'
        />
      </Tooltip>
    </Styled>
  );
}
