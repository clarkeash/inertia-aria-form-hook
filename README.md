# inertia-aria-form-hook

## Installation

Install with npm:

```bash
npm install @clarkeash/inertia-aria-form-hook
```

Or with yarn:

```bash
yarn add @clarkeash/inertia-aria-form-hook
```

## Usage

```
export default function Register() {
    const { errors, isSubmitting, handleSubmit } = useInertiaAriaForm();

    return (
        <Form onSubmit={handleSubmit(RegisteredUserController.store().url)}>
            ...
        </Form>
    );
}
```