# orders-status-changes

This service acts as a single-handler webhook service allowing OMS to call us with their order status change updates.

We then push valid order status change updates as EventBridge messages for later internal message consumption and further business logic along with it.
