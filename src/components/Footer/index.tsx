import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import Polling from '../Header/Polling'
import './Footer.css'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer id="footer">
      <ul className="footer_nav">
        <li>
          <NavLink to={'/Home'}>
            <i className="fas fa-home"></i>
            <h6>{t('HOME')}</h6>
          </NavLink>
        </li>
        <li>
          <NavLink to={'/swap'}>
            <i className="fas fa-exchange-alt"></i>
            <h6>{t('SWAP')}</h6>
          </NavLink>
        </li>
        <li>
          <NavLink to={'/pool'} isActive={(match, { pathname }) =>
              Boolean(match) ||
              pathname.startsWith('/add') ||
              pathname.startsWith('/remove') ||
              pathname.startsWith('/create') ||
              pathname.startsWith('/find')
            }
          >
            <i className="fas fa-compress-alt"></i>
            <h6>{t('POOL')}</h6>
          </NavLink>
        </li>
        <li>
          <NavLink to={'/farms'}>
            <i className="fas fa-egg"></i>
            <h6>{t('FARM')}</h6>
          </NavLink>
        </li>
      </ul>
      <Polling />
    </footer>
  )
}
