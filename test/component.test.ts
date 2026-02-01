import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { QBtn } from 'quasar'

// Example component for testing
const ExampleComponent = defineComponent({
  name: 'ExampleComponent',
  template: `
    <div>
      <h1>{{ title }}</h1>
      <QBtn @click="increment" label="Click me" />
      <p>Count: {{ count }}</p>
    </div>
  `,
  components: { QBtn },
  data() {
    return {
      title: 'Test Component',
      count: 0,
    }
  },
  methods: {
    increment() {
      this.count++
    },
  },
})

describe('Vue Component Testing Example', () => {
  test('should render component correctly', () => {
    const wrapper = mount(ExampleComponent)
    expect(wrapper.find('h1').text()).toBe('Test Component')
  })

  test('should increment count when button is clicked', async () => {
    const wrapper = mount(ExampleComponent)
    const button = wrapper.findComponent(QBtn)

    expect(wrapper.find('p').text()).toBe('Count: 0')

    await button.trigger('click')

    expect(wrapper.find('p').text()).toBe('Count: 1')
  })

  test('should have correct initial data', () => {
    const wrapper = mount(ExampleComponent)
    expect(wrapper.vm.title).toBe('Test Component')
    expect(wrapper.vm.count).toBe(0)
  })
})
