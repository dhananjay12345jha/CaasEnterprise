# stock-quantity-updates

This service acts as a single-handler webhook service allowing OMS to call us with their stock quantity updates.

We then push valid stock quantity updates as EventBridge messages for later internal message consumption and further business logic along with it.
