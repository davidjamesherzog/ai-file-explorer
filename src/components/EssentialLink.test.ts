import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EssentialLink from './EssentialLink.vue'

describe('EssentialLink.vue', () => {
  const mockProps = {
    title: 'Test Link',
    caption: 'test caption',
    link: 'https://example.com',
    icon: 'home',
  }

  const globalConfig = {
    stubs: {
      'q-item': {
        props: ['href'],
        template: '<a class="q-item" :href="href"><slot /></a>',
      },
      'q-item-section': {
        props: { avatar: Boolean },
        template:
          '<div class="q-item-section" :class="{ avatar }"><slot /></div>',
      },
      'q-icon': {
        props: ['name'],
        template: '<div class="q-icon" :name="name"></div>',
      },
      'q-item-label': {
        props: { caption: Boolean },
        template:
          '<div class="q-item-label" :class="{ \'q-item-label--caption\': caption }"><slot /></div>',
      },
    },
  }

  test('renders correctly with all props', () => {
    const wrapper = mount(EssentialLink, {
      props: mockProps,
      global: globalConfig,
    })

    expect(wrapper.text()).toContain('Test Link')
    expect(wrapper.text()).toContain('test caption')
    expect(wrapper.find('.q-item').attributes('href')).toBe(
      'https://example.com'
    )
    expect(wrapper.find('.q-icon').attributes('name')).toBe('home')
    expect(wrapper.find('.q-item-label--caption').text()).toBe('test caption')
  })

  test('renders without icon', () => {
    const wrapper = mount(EssentialLink, {
      props: { ...mockProps, icon: '' },
      global: globalConfig,
    })

    expect(wrapper.find('.q-icon').exists()).toBe(false)
  })

  test('uses default link if not provided', () => {
    const wrapper = mount(EssentialLink, {
      props: { title: 'No Link' },
      global: globalConfig,
    })

    expect(wrapper.find('.q-item').attributes('href')).toBe('#')
  })
})
