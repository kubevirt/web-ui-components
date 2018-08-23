import { configure } from '@storybook/react'
import { setOptions } from '@storybook/addon-options'

const storyContext = require.context('../src', true, /\.stories\.js$/)

function loadStories() {
  storyContext.keys().forEach(storyContext)
}

setOptions({
  name: 'kubevirt-web-ui',
  sortStoriesByKind: true
})

configure(loadStories, module)
