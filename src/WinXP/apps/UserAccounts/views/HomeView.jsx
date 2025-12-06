import {
  BlueContentPane,
  ContentHeader,
  SectionTitle,
  TaskLinksSection,
  BlueTaskLink,
  UsersGrid,
  UserCard,
  UserAvatar,
  GuestAvatar,
  UserInfo,
  UserName,
  UserType,
} from '../styles';

function HomeView({ users, isAdmin, onNavigate, onOpenWindow, VIEW }) {
  return (
    <BlueContentPane>
      <ContentHeader>
        <img src="/icons/xp/UserAccounts.png" alt="" />
        <span>User Accounts</span>
      </ContentHeader>

      <SectionTitle>Pick a task...</SectionTitle>
      <TaskLinksSection>
        <BlueTaskLink onClick={() => onNavigate(VIEW.PICK_TASK, users[0]?.id)}>
          <img src="/icons/xp/Go.png" alt="" />
          <span>Change an account</span>
        </BlueTaskLink>
        {isAdmin && (
          <BlueTaskLink onClick={() => onNavigate(VIEW.CREATE_ACCOUNT_NAME)}>
            <img src="/icons/xp/Go.png" alt="" />
            <span>Create a new account</span>
          </BlueTaskLink>
        )}
        <BlueTaskLink onClick={() => onOpenWindow?.('Help and Support')}>
          <img src="/icons/xp/Go.png" alt="" />
          <span>Change the way users log on or off</span>
        </BlueTaskLink>
      </TaskLinksSection>

      <SectionTitle>or pick an account to change</SectionTitle>
      <UsersGrid>
        {users.map(user => (
          <UserCard
            key={user.id}
            onClick={() => onNavigate(VIEW.PICK_TASK, user.id)}
            title={`Change this person's account\naccount type, name, password, or delete the\naccount.`}
          >
            <UserAvatar src={user.picture} alt={user.name} />
            <UserInfo>
              <UserName>{user.name}</UserName>
              <UserType>{user.accountType === 'admin' ? 'Computer administrator' : 'Limited account'}</UserType>
              {user.hasPassword && <UserType>Password protected</UserType>}
            </UserInfo>
          </UserCard>
        ))}
        <UserCard onClick={() => {}} title="Guest account is off">
          <GuestAvatar>
            <img src="/icons/xp/UserAccounts.png" alt="Guest" />
          </GuestAvatar>
          <UserInfo>
            <UserName>Guest</UserName>
            <UserType>Guest account is off</UserType>
          </UserInfo>
        </UserCard>
      </UsersGrid>
    </BlueContentPane>
  );
}

export default HomeView;
