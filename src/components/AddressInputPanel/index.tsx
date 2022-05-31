import React, { useCallback } from 'react'
import useENS from '../../hooks/useENS'
import { useActiveWeb3React } from '../../hooks'
import { ExternalLink, TYPE } from '../../theme'
import { getEtherscanLink } from '../../utils'

export default function AddressInputPanel({
  // id,
  value,
  onChange
}: {
  // id?: string
  // the typed string value
  value: string
  // triggers whenever the typed value changes
  onChange: (value: string) => void
}) {
  const { chainId } = useActiveWeb3React()
  const { address, name } = useENS(value)

  const handleInput = useCallback(
    event => {
      const input = event.target.value
      const withoutSpaces = input.replace(/\s+/g, '')
      onChange(withoutSpaces)
    },
    [onChange]
  )

  return (
    <div className="recipient">
      <article className="head">
        Recipient
        {address && chainId && (
          <ExternalLink href={getEtherscanLink(chainId, name ?? address, 'address')} style={{ fontSize: '14px' }}>
            (View on Polygon)
          </ExternalLink>
        )}
      </article>
      <article className="body">
        <input
          className="address_input"
          type="text"
          placeholder="Wallet Address or ENS name"
          onChange={handleInput}
          value={value}
        />
      </article>
    </div>
  )
}
