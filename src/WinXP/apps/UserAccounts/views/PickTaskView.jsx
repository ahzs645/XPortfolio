import {
  ContentPane,
  PageTitle,
  TasksContainer,
  TasksList,
  TaskLink,
  UserPreview,
  UserAvatar,
} from '../styles';
import { withBaseUrl } from '../../../../utils/baseUrl';

function PickTaskView({
  selectedUser,
  isAdmin,
  activeUserId,
  onNavigate,
  VIEW,
}) {
  return (
    <ContentPane>
      <PageTitle>What do you want to change about {selectedUser?.name}'s account?</PageTitle>
      <TasksContainer>
        <TasksList>
          <TaskLink onClick={() => onNavigate(VIEW.CHANGE_NAME)}>
            <img src={withBaseUrl('/icons/xp/Go.png')} alt="" height="16" />
            Change the name
          </TaskLink>
          <TaskLink onClick={() => onNavigate(VIEW.CHANGE_PICTURE)}>
            <img src={withBaseUrl('/icons/xp/Go.png')} alt="" height="16" />
            Change the picture
          </TaskLink>
          {selectedUser?.hasPassword ? (
            <>
              <TaskLink onClick={() => onNavigate(VIEW.CHANGE_PASSWORD)}>
                <img src={withBaseUrl('/icons/xp/Go.png')} alt="" height="16" />
                Change the password
              </TaskLink>
              <TaskLink onClick={() => onNavigate(VIEW.REMOVE_PASSWORD)}>
                <img src={withBaseUrl('/icons/xp/Go.png')} alt="" height="16" />
                Remove the password
              </TaskLink>
            </>
          ) : (
            <TaskLink onClick={() => onNavigate(VIEW.CREATE_PASSWORD)}>
              <img src={withBaseUrl('/icons/xp/Go.png')} alt="" height="16" />
              Create a password
            </TaskLink>
          )}
          {isAdmin && (
            <TaskLink onClick={() => onNavigate(VIEW.CHANGE_ACCOUNT_TYPE)}>
              <img src={withBaseUrl('/icons/xp/Go.png')} alt="" height="16" />
              Change the account type
            </TaskLink>
          )}
          {isAdmin && selectedUser?.id !== activeUserId && (
            <TaskLink onClick={() => onNavigate(VIEW.DELETE_ACCOUNT)}>
              <img src={withBaseUrl('/icons/xp/Go.png')} alt="" height="16" />
              Delete the account
            </TaskLink>
          )}
        </TasksList>
        <UserPreview>
          <UserAvatar src={withBaseUrl(selectedUser?.picture)} alt={selectedUser?.name} />
          <div>
            <strong>{selectedUser?.name}</strong>
            <br />
            {selectedUser?.accountType === 'admin' ? 'Computer administrator' : 'Limited account'}
          </div>
        </UserPreview>
      </TasksContainer>
    </ContentPane>
  );
}

export default PickTaskView;
