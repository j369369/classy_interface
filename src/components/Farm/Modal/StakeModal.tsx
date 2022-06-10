import React from 'react';
import './FarmModal.css';
import '../../Modal/Modal.css';
import { FarmConfig } from '../../../constants/farm/types';
import { Input as NumericalInput } from '../../NumericalInput';
import CloseIcon from '../../Modal/CloseIcon';

interface StakeModalProps {
  farm?: FarmConfig;
  tokenBalance?: string | number;
  withdrawValue?: any;
  setWithdrawValue?: any;
  onDismiss?: any;
}

export default function StakeModal({farm, tokenBalance, withdrawValue, setWithdrawValue, onDismiss}: StakeModalProps) {
return (
  <div className="modal_container">
    <section className="modal_head">
      <h4>Stake LP tokens</h4>
      <CloseIcon close={onDismiss} />
    </section>
    <section className="modal_body">
      <div className="m_card">
          <div className="dis_flex_col gap16">
            <article className="dis_flex_col gap8">
              <div className="dis_flex between">
                <h5 className="text">Stake Amount</h5>
                <h5 className="text gray">{!farm?.lpSymbol ? '-' : `${farm?.lpSymbol}`} LP</h5>
              </div>
              <div>
                <h6 className="text mint fw_400">Wallet Balance : {tokenBalance}</h6>
              </div>
              </article>
            <article>
              <NumericalInput
                className="number_input"
                value={withdrawValue}
                onUserInput={setWithdrawValue}
              />
            </article>
            <article>
            <section className="dis_flex between gap4">
              <button className="button line md yellow w100p">
                25%
              </button>
              <button className="button line md yellow w100p">
                50%
              </button>
              <button className="button line md yellow w100p">
                75%
              </button>
              <button className="button line md yellow w100p">
                Max
              </button>
            </section>
            </article>
          </div>
      </div>
      <ul className="modal_info_list">
        <li>
          <div className="info_title"><h4 className="text yellow f_cookie">Output</h4></div>
        </li>
      </ul>
      <ul className="modal_info_list">
        <li>
          <div className="info_title">Staked Balance</div>
          <div className="info_contents">
            <span className="num">123123123</span>
          </div>
        </li>
        <li>
          <div className="info_title">Wallet Balance</div>
          <div className="info_contents">
            <span className="num">33</span>
          </div>
        </li>
      </ul>

      <article>
        <button type="button" className="button round lg green w100p">Approve</button>
      </article>
    </section>
  </div>
)}