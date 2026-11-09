import { useId, type FormHTMLAttributes, type Ref } from 'react'
import { FieldIdContext } from './contexts/FieldIdContext'

type Props = FormHTMLAttributes<HTMLFormElement> & {
  ref?: Ref<HTMLFormElement>
}

/**
 * Native <form> for use inside a react-hook-form `<FormProvider>` (same role as in
 * benefit-ng-react, without the navigation guard — our forms are short modals and cards).
 * Sets `noValidate` so validation messages come from the Zod schema, not the browser.
 */
const HookForm = ({ ref, children, ...props }: Props) => {
  // Unique prefix per form instance for DOM ids.
  const idPrefix = useId()

  return (
    <FieldIdContext.Provider value={{ getFieldId: field => `${idPrefix}${field}` }}>
      <form noValidate ref={ref} {...props}>
        {children}
      </form>
    </FieldIdContext.Provider>
  )
}

export default HookForm
