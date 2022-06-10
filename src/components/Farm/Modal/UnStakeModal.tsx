import React from 'react';
import './FarmModal.css';
import '../../Modal/Modal.css';
import { FarmConfig } from '../../../constants/farm/types';
import CloseIcon from '../../Modal/CloseIcon';

interface UnStakeModalProps {
  farm?: FarmConfig;
  onDismiss?: any;
}

export default function UnStakeModal({farm, onDismiss}: UnStakeModalProps) {
return (
  <div className="modal_container">
    <section className="modal_head">
      <h4>Unstake LP tokens</h4>
      <CloseIcon close={onDismiss} />
    </section>
    <section className="modal_body">
      <ul className="modal_info_list">
        <li>
          <div className="info_title"><h4 className="text yellow f_cookie">You will receive</h4></div>
        </li>
      </ul>
      <ul className="modal_info_list">
        <li>
          <div className="info_title"><strong>{!farm?.lpSymbol ? '-' : `${farm?.lpSymbol}`}</strong> LP</div>
          <div className="info_contents">
            <span className="num">11</span>
          </div>
        </li>
        <li>
          <div className="info_title"><strong>CLSY</strong></div>
          <div className="info_contents">
            <span className="num">11</span>
          </div>
        </li>
      </ul>

      <article>
        <button type="button" className="button round lg ocean w100p">Confirm</button>
      </article>
    </section>
  </div>
)}