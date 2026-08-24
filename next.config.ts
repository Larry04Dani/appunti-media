import nextMDX from '@next/mdx'
import type { NextConfig } from 'next'

const withMDX = nextMDX()

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
}

export default withMDX(nextConfig)