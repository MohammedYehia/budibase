<script>
  import AutomationList from "./AutomationList.svelte"
  import CreateAutomationModal from "./CreateAutomationModal.svelte"
  import { Icon, Modal, Tabs, Tab } from "@budibase/bbui"

  export let modal
  export let webhookModal
</script>

<div class="title">
  <Tabs selected="Automations">
    <Tab title="Automations">
      <AutomationList />
      <Modal bind:this={modal}>
        <CreateAutomationModal {webhookModal} />
      </Modal>
    </Tab>
  </Tabs>
  <div class="add-button" data-cy="new-screen">
    <Icon hoverable name="AddCircle" on:click={modal.show} />
  </div>
</div>

<style>
  .add-button {
    position: absolute;
    top: var(--spacing-l);
    right: var(--spacing-xl);
  }

  .title {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    position: relative;
  }
</style>
