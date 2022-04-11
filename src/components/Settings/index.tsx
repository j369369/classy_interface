import React, { /*useContext,*/ useRef, useState } from 'react'
import { Settings, X } from 'react-feather'
import { Text } from 'rebass'
import styled /*, { ThemeContext }*/ from 'styled-components'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleSettingsMenu } from '../../state/application/hooks'
import {
  useExpertModeManager,
  useUserTransactionTTL,
  useUserSlippageTolerance,
  useUserSingleHopOnly
} from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import Toggle from '../Toggle'
import TransactionSettings from '../TransactionSettings'

import './Settings.css'

// const StyledMenuIcon = styled(Settings)`
//   height: 20px;
//   width: 20px;

//   > * {
//     stroke: ${({ theme }) => theme.text2};
//   }

//   :hover {
//     opacity: 0.7;
//   }
// `

const StyledCloseIcon = styled(X)`
  height: 20px;
  width: 20px;
  :hover {
    cursor: pointer;
  }

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

// const StyledMenuButton = styled.button`
//   position: relative;
//   width: 100%;
//   height: 100%;
//   border: none;
//   background-color: transparent;
//   margin: 0;
//   padding: 0;
//   height: 35px;

//   padding: 0.15rem 0.5rem;
//   border-radius: 0.5rem;

//   :hover,
//   :focus {
//     cursor: pointer;
//     outline: none;
//   }

//   svg {
//     margin-top: 2px;
//   }
// `
const EmojiWrapper = styled.div`
  position: absolute;
  bottom: -6px;
  right: 0px;
  font-size: 14px;

  span {
    display: block; 
    margin: -40px 35px 0 0; 
    font-size: 24px;
  }
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.div`
  min-width: 20.125rem;
  background: var(--bg-gradient-white-03);
  backdrop-filter: var(--bg-filter-blur);
  box-shadow: var(--bg-box-shadow);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 3rem;
  right: 0rem;
  z-index: 100;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 18.125rem;
  `};
`

const Break = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg3};
`

const ModalContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
  border-radius: 1rem;
`

const ExpertModeIcon = styled.strong`
  display: inline-block;
  margin: 6px 6px 0 0
  width: 80px;
  color: var(--purple);
  font-size: 17px;
`

const SettingIcon = () => {
  return(
    <div className="setting">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26.363 23.068">
        <defs>
          <linearGradient id="linear-gradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0" stop-color="#2ffff7"/>
            <stop offset="1" stop-color="#f9d74a"/>
          </linearGradient>
        </defs>
        <path d="M25.539,50.125H8.239V49.3a.826.826,0,0,0-.824-.824H5.767a.826.826,0,0,0-.824.824v.824H.824A.826.826,0,0,0,0,50.949V52.6a.826.826,0,0,0,.824.824H4.943v.824a.826.826,0,0,0,.824.824H7.415a.826.826,0,0,0,.824-.824V53.42h17.3a.826.826,0,0,0,.824-.824V50.949A.826.826,0,0,0,25.539,50.125Zm0-8.239H21.42v-.824a.826.826,0,0,0-.824-.824H18.949a.826.826,0,0,0-.824.824v.824H.824A.826.826,0,0,0,0,42.71v1.648a.826.826,0,0,0,.824.824h17.3v.824a.826.826,0,0,0,.824.824H20.6a.826.826,0,0,0,.824-.824v-.824h4.119a.826.826,0,0,0,.824-.824V42.71A.826.826,0,0,0,25.539,41.886Zm0-8.239H14.829v-.824A.826.826,0,0,0,14.005,32H12.358a.826.826,0,0,0-.824.824v.824H.824A.826.826,0,0,0,0,34.472v1.648a.826.826,0,0,0,.824.824h10.71v.824a.826.826,0,0,0,.824.824h1.648a.826.826,0,0,0,.824-.824v-.824h10.71a.826.826,0,0,0,.824-.824V34.472A.826.826,0,0,0,25.539,33.648Z" transform="translate(0 -32)" fill="url(#linear-gradient)"/>
      </svg>
    </div>
  )
}



export default function SettingsTab() {
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.SETTINGS)
  const toggle = useToggleSettingsMenu()

  //const theme = useContext(ThemeContext)
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance()

  const [ttl, setTtl] = useUserTransactionTTL()

  const [expertMode, toggleExpertMode] = useExpertModeManager()

  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()

  // show confirmation view before turning on
  const [showConfirmation, setShowConfirmation] = useState(false)

  useOnClickOutside(node, open ? toggle : undefined)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <Modal isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)} maxHeight={100}>
        <ModalContentWrapper>
          <AutoColumn gap="md" >
            <RowBetween style={{ padding: '0 1rem', textAlign: 'center' }}>
              <div />
              <Text fontWeight={500} fontSize={16}>
                {/* Are you sure? */}
                Confirm expert mode
              </Text>
              <StyledCloseIcon onClick={() => setShowConfirmation(false)} />
            </RowBetween>
            <Break />
            <AutoColumn gap="md" style={{ padding: '0 1rem', textAlign: 'center' }}>
              <Text fontWeight={400} fontSize={14}>
                Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result
                in bad rates and lost funds.
              </Text>
              <Text fontWeight={700} fontSize={14}>
                ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
              </Text>
              <ButtonError
                error={true}
                padding={'12px'}
                onClick={() => {
                  if (window.prompt(`Please type the word "confirm" to enable expert mode.`) === 'confirm') {
                    toggleExpertMode()
                    setShowConfirmation(false)
                  }
                }}
              >
                <Text fontSize={16} fontWeight={500} id="confirm-expert-mode">
                  Turn On Expert Mode
                </Text>
              </ButtonError>
            </AutoColumn>
          </AutoColumn>
        </ModalContentWrapper>
      </Modal>
      <div onClick={toggle}>
        <SettingIcon />
        {expertMode ? (
          <EmojiWrapper>
            <span role="img" aria-label="wizard-icon">
              {/* 🧙 */}
            </span>
            <ExpertModeIcon>
              <i className="fas fa-bong"></i> 
            </ExpertModeIcon>
          </EmojiWrapper>
        ) : null}
      </div>
      {open && (
        <div className="setting_wrap">
          <section className="setting_head">
            <h6>Transaction Settings</h6>
          </section>
          <section className="setting_body">
            <TransactionSettings
              rawSlippage={userSlippageTolerance}
              setRawSlippage={setUserslippageTolerance}
              deadline={ttl}
              setDeadline={setTtl}
            />
            <article className="setting_interface">
              <h6 className="text yellow">Interface Settings</h6>
              <RowBetween>
                <RowFixed>
                  <p className="set_title">Toggle Expert Mode</p>
                  <QuestionHelper text="Bypasses confirmation modals and allows high slippage trades. Use at your own risk." />
                </RowFixed>
                <Toggle
                  id="toggle-expert-mode-button"
                  isActive={expertMode}
                  toggle={
                    expertMode
                      ? () => {
                          toggleExpertMode()
                          setShowConfirmation(false)
                        }
                      : () => {
                          toggle()
                          setShowConfirmation(true)
                        }
                  }
                />
              </RowBetween>
              <RowBetween>
                <RowFixed>
                  <p className="set_title">Disable Multihops</p>
                  <QuestionHelper text="Restricts swaps to direct pairs only." />
                </RowFixed>
                <Toggle
                  id="toggle-disable-multihop-button"
                  isActive={singleHopOnly}
                  toggle={() => (singleHopOnly ? setSingleHopOnly(false) : setSingleHopOnly(true))}
                />
              </RowBetween>
            </article>
          </section>
        </div>
      )}
    </StyledMenu>
  )
}
