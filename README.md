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

```jsx
import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { Form, TextField, Label, Input } from "react-aria-components";

export default function Register() {
    const { errors, isSubmitting, handleSubmit } = useInertiaAriaForm();

    return (
        <Form onSubmit={handleSubmit(RegisteredUserController.store().url)}>
            <TextField name="name">
                <Label>Name</Label>
                <Input />
            </TextField>
            ...
            <Button type="submit">Submit</Button>
        </Form>
    );
}
```
