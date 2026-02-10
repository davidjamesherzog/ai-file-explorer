import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MainLayout from './MainLayout.vue'
import { h } from 'vue'

describe('MainLayout.vue', () => {
  const globalConfig = {
    stubs: {
      'q-layout': { template: '<div class="q-layout"><slot /></div>' },
      'q-header': { template: '<header class="q-header"><slot /></header>' },
      'q-toolbar': { template: '<div class="q-toolbar"><slot /></div>' },
      'q-toolbar-title': {
        template: '<div class="q-toolbar-title"><slot /></div>',
      },
      'q-btn': {
        props: ['icon'],
        template:
          '<button class="q-btn" :icon="icon" @click="$emit(\'click\', $event)"></button>',
      },
      'q-drawer': {
        props: ['modelValue'],
        setup(props: any, { slots }: any) {
          return () =>
            h(
              'div',
              {
                class: ['q-drawer', props.modelValue ? 'open' : ''],
              },
              slots.default?.()
            )
        },
      },
      'q-list': { template: '<div class="q-list"><slot /></div>' },
      'q-item-label': { template: '<div class="q-item-label"><slot /></div>' },
      'q-item': {
        props: ['to'],
        template: '<div class="q-item" :to="to"><slot /></div>',
      },
      'q-item-section': {
        template: '<div class="q-item-section"><slot /></div>',
      },
      'q-icon': {
        props: ['name'],
        template: '<div class="q-icon" :name="name"></div>',
      },
      'q-separator': { template: '<div class="q-separator"></div>' },
      'q-page-container': {
        template: '<main class="q-page-container"><slot /></main>',
      },
      EssentialLink: {
        props: ['title'],
        template: '<div class="essential-link">{{ title }}</div>',
      },
      'router-view': { template: '<div class="router-view"></div>' },
    },
  }

  test('renders header title', () => {
    const wrapper = mount(MainLayout, { global: globalConfig })
    expect(wrapper.find('.q-toolbar-title').text()).toBe('AI File Explorer')
  })

  test('toggles left drawer', async () => {
    const wrapper = mount(MainLayout, { global: globalConfig })

    expect(wrapper.find('.q-drawer').classes()).not.toContain('open')

    // Call the method directly to check for reactivity issue with trigger
    const vm = wrapper.vm as any
    vm.toggleLeftDrawer()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.q-drawer').classes()).toContain('open')
  })

  test('renders navigation links', () => {
    const wrapper = mount(MainLayout, { global: globalConfig })
    expect(wrapper.find('.q-item[to="/"]').exists()).toBe(true)

    const links = wrapper.findAll('.essential-link')
    expect(links.length).toBeGreaterThan(0)
    expect(links[0].text()).toBe('Docs')
  })
})
