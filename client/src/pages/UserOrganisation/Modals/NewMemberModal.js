import {
    NoticeBox,
    Button,
    Modal,
    ModalTitle,
    ModalContent,
    ReactFinalForm,
    InputFieldFF,
    hasValue,
    email,
    composeValidators,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import styles from './Modal.module.css'
import * as api from 'src/api'
import { useSuccessAlert, useErrorAlert } from 'src/lib/use-alert'

const NewMemberModal = ({ organisation, mutate, onClose }) => {
    const successAlert = useSuccessAlert()
    const errorAlert = useErrorAlert()

    const handleSubmit = async ({ email }) => {
        try {
            await api.addOrganisationMember(organisation.id, email)
            mutate({
                ...organisation,
                users: [...organisation.users, { email }],
            })
            successAlert.show({
                message: `Successfully added ${email} to organisation`,
            })
            onClose()
        } catch (error) {
            errorAlert.show({ error })
        }
    }

    return (
        <Modal onClose={onClose} small>
            <ModalTitle>Add member</ModalTitle>
            <ModalContent>
                <NoticeBox>
                    The new member must have logged in with the email address at
                    least once before being able to be added to an organisation.
                </NoticeBox>
                <ReactFinalForm.Form onSubmit={handleSubmit}>
                    {({ handleSubmit, valid, submitting }) => (
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <ReactFinalForm.Field
                                required
                                name="email"
                                type="email"
                                label="Email of new member"
                                placeholder="user@email.com"
                                component={InputFieldFF}
                                validate={composeValidators(hasValue, email)}
                            />
                            <div className={styles.actions}>
                                <Button
                                    type="submit"
                                    primary
                                    disabled={!valid || submitting}
                                >
                                    Add member
                                </Button>
                                <Button onClick={onClose} secondary>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                </ReactFinalForm.Form>
            </ModalContent>
        </Modal>
    )
}

NewMemberModal.propTypes = {
    mutate: PropTypes.object.isRequired,
    organisation: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default NewMemberModal
