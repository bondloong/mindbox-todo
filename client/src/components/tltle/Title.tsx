import React from 'react'
import './Title.css'

type Props = {
	children: React.ReactNode
}

export const Title = ({children}: Props) => {
  return (
	<h1>{children}</h1>
  )
}
