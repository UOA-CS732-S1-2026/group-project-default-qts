import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import DashboardHeader from '../dashboard/DashboardHeader'

vi.mock('../userconfig/UserMenu', () => ({
  default: () => <div data-testid="user-menu" />,
}))

describe('DashboardHeader', () => {
  it('renders the app title when pet is not evolution-ready', () => {
    render(<DashboardHeader coins={0} activePet={null} onEvolveRequest={vi.fn()} />)
    expect(screen.getByText(/GrowFriend/i)).toBeInTheDocument()
  })

  it('renders the evolve button when pet.evolutionReady is true', () => {
    render(<DashboardHeader coins={0} activePet={{ evolutionReady: true }} onEvolveRequest={vi.fn()} />)
    expect(screen.getByRole('button', { name: /evolve/i })).toBeInTheDocument()
    expect(screen.queryByText(/GrowFriend/i)).not.toBeInTheDocument()
  })

  it('calls onEvolveRequest when the evolve button is clicked', async () => {
    const onEvolveRequest = vi.fn()
    render(<DashboardHeader coins={0} activePet={{ evolutionReady: true }} onEvolveRequest={onEvolveRequest} />)
    await userEvent.click(screen.getByRole('button', { name: /evolve/i }))
    expect(onEvolveRequest).toHaveBeenCalledOnce()
  })

  it('displays the coin amount via CoinBadge', () => {
    render(<DashboardHeader coins={150} activePet={null} onEvolveRequest={vi.fn()} />)
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('renders the UserMenu', () => {
    render(<DashboardHeader coins={0} activePet={null} onEvolveRequest={vi.fn()} />)
    expect(screen.getByTestId('user-menu')).toBeInTheDocument()
  })
})
