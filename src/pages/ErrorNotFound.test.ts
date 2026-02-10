import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorNotFound from './ErrorNotFound.vue'

describe('ErrorNotFound.vue', () => {
  const globalConfig = {
    stubs: {
      'q-btn': {
        props: ['to', 'label'],
        template: '<button class="q-btn" :to="to">{{ label }}</button>',
      },
    },
  }

  test('renders 404 message', () => {
    const wrapper = mount(ErrorNotFound, { global: globalConfig })
    expect(wrapper.text()).toContain('404')
    expect(wrapper.text()).toContain('Oops. Nothing here...')
  })

  test('renders home button', () => {
    const wrapper = mount(ErrorNotFound, { global: globalConfig })
    const btn = wrapper.find('.q-btn')
    expect(btn.text()).toBe('Go Home')
    expect(btn.attributes('to')).toBe('/')
  })
})
