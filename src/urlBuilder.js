import { invariant, includes, shouldBeOneOf } from './utils'

const typeOptions = [
  'upload', 'fetch', 'facebook', 'twitter', 'twitter_name', 'instagram', 'instagram_name', 'gplus', 'gravatar'
]


export const compile = (parameterSet, transform, defaultTransform) => {
  if (!transform || !parameterSet || Object.keys(transform).length === 0) {
    return ''
  }

  const compile = parameters => (
    Object.keys(parameters)
      .map(param => parameterSet(param, parameters[param]))
      .join(',')
  )

  return '/' + (
    Array.isArray(transform)
      ? transform.map(compile).join('/')
      : compile({...defaultTransform, ...transform})
  )
}


const urlBuilder = (parameterSets = {}, defaultResourceType = 'image') => ({
  cloudName,
  // cdnSubdomain = false,
  cname = 'res.cloudinary.com',
  secure: defaultSecure = true,
  defaults: {
    type: defaultType = 'upload',
    ...defaultTransform
  } = {},
}) => {
  process.env.NODE_ENV !== 'production' && invariant(
    cloudName, 'cloudName', cloudName, 'configuration is required', '/node_additional_topics#configuration_options'
  )

  const baseUrl = `://${cname}/${cloudName}/`

  return (publicId, options = {}) => {
    let {
      resourceType = defaultResourceType,
      secure = defaultSecure,
      type = defaultType,
      version = '1',
      ...transform
    } = options

    if (options.transform) {
      transform = options.transform
    } else if (Array.isArray(options)) {
      transform = options
    }

    process.env.NODE_ENV !== 'production' && invariant(
      !transform || Object.keys(transform).length === 0
      || resourceType === 'raw' || includes(resourceType, Object.keys(parameterSets)),
      'resourceType', resourceType, shouldBeOneOf(['raw', ...Object.keys(parameterSets)])
      + ', fix the resource type or add additional transform parameters to the configuration', null
    )

    process.env.NODE_ENV !== 'production' && invariant(
      includes(type, typeOptions), 'type', type, shouldBeOneOf(typeOptions), null
    )

    const compiledTransform = compile(parameterSets[resourceType], transform, defaultTransform)

    return `http${secure ? 's' : ''}${baseUrl}${resourceType}/${type}${compiledTransform}/v${version}/${publicId}`
  }
}

export default urlBuilder
