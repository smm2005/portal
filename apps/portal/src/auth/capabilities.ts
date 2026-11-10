export interface PortalCapabilities {
  clubAccess: boolean
  boardMember: boolean
  administrator: boolean
  superuser: boolean
}

export interface PortalNavigationItem {
  label: string
  to: string
  hash?: string
  description: string
  section?: 'admin'
}

export function navigationForCapabilities(
  capabilities: PortalCapabilities,
): Array<PortalNavigationItem> {
  const navigation: Array<PortalNavigationItem> = [
    {
      label: 'Dashboard',
      to: '/',
      description: 'Open dashboard.',
    },
    {
      label: 'Account',
      to: '/account',
      description: 'View your account and permissions.',
    },
    {
      label: 'Contact',
      to: '/contact',
      description: 'Find USSTM contact details.',
    },
    {
      label: 'Resources',
      to: '/resources',
      description: 'Useful links and resources.',
    },
  ]

  if (
    capabilities.clubAccess ||
    capabilities.administrator ||
    capabilities.superuser
  ) {
    navigation.push({
      label: 'Events',
      to: '/events',
      description: 'Create and manage events for your club.',
    })
  }

  if (capabilities.clubAccess) {
    navigation.push({
      label: 'Club Access',
      to: '/account',
      hash: 'clubs',
      description: 'Manage club access.',
    })
  }

  if (capabilities.boardMember || capabilities.administrator) {
    navigation.push({
      label: 'Board Member',
      to: '/account',
      hash: 'board-position',
      description: 'Manage USSTM board member details.',
    })
    navigation.push({
      label: 'Pickup',
      to: '/pickup',
      description: 'Manage orders from Square merchandise platform.'
    })
  }

  navigation.push({
    label: 'Office Hours',
    to: '/office-hours',
    description: 'View and book Office Hours shifts.',
  })

  if (capabilities.administrator || capabilities.superuser) {
    navigation.push(
      {
        label: 'Members',
        to: '/admin/members',
        description: 'Manage USSTM members.',
        section: 'admin',
      },
      {
        label: 'Clubs',
        to: '/admin/clubs',
        description: 'Manage USSTM clubs.',
        section: 'admin',
      },
      {
        label: 'Manage Resources',
        to: '/admin/resources',
        description: 'Manage resources.',
        section: 'admin',
      },
      {
        label: 'Board Members',
        to: '/admin/board-members',
        description: 'Manage board members.',
        section: 'admin',
      },
      {
        label: 'Audit History',
        to: '/admin/audit-history',
        description: 'View audit history.',
        section: 'admin',
      },
    )
  }

  return navigation
}
