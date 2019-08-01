'use strict';

const classnames = require('classnames');
const propTypes = require('prop-types');
const { createElement } = require('preact');

const { withServices } = require('../util/service-context');
const useStore = require('../store/use-store');

function FocusedModeHeader({ settings }) {
  const store = useStore(store => ({
    focusedMode: store.getState().focusedMode,
    actions: {
      setFocusedMode: store.setFocusedMode,
    },
  }));

  const toggleFocusedMode = () => {
    store.actions.setFocusedMode(!store.focusedMode);
  };

  return (
    <div className="focused-mode-header">
      <button
        onClick={toggleFocusedMode}
        className={classnames(
          {
            'focused-mode-header__inactive': !store.focusedMode,
          },
          'primary-action-btn primary-action-btn--short'
        )}
        title={`Toggle to show annotations only by ${settings.focusedUser}`}
      >
        Show annotations by {settings.focusedUser}
      </button>
    </div>
  );
}
FocusedModeHeader.propTypes = {
  // Injected services.
  settings: propTypes.object.isRequired,
};

FocusedModeHeader.injectedProps = ['settings'];

module.exports = withServices(FocusedModeHeader);
