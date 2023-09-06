export class BrazeResponse {
  users: User[];
  message: string;
}

export class User {
  created_at: string;
  user_aliases: Alias[];
  appboy_id: string;
  external_id: string;
  braze_id: string;
  random_bucket: number;
  email: string;
  custom_attributes: CustomAttributes;
  custom_events: CustomEvent[];
  purchases: Purchase[];
  time_zone: string;
  total_revenue: number;
  push_subscribe: string;
  email_subscribe: string;
  email_opted_in_at: string;
  apps: App[];
  campaigns_received: any[];
  canvases_received: CanvasesReceived[];
}

export class Alias {
  alias_name: string;
  alias_label: string;
}

export class CustomAttributes {
  account_type: string;
  account_status: string;
  brand_name: string;
  language_code: string;
  country_code: string;
}

export class CustomEvent {
  name: string;
  first: string;
  last: string;
  count: number;
}

export class Purchase {
  name: string;
  first: string;
  last: string;
  count: number;
}

export class App {
  name: string;
  platform: string;
  version: any;
  sessions: number;
  first_used: any;
  last_used: any;
}

export class CanvasesReceived {
  name: string;
  api_canvas_id: string;
  last_received_message: string;
  last_entered: string;
  variation_name: string;
  in_control: boolean;
  is_in_control: boolean;
  last_entered_control_at: any;
  last_exited: string;
  steps_received: StepsReceived[];
}

export class StepsReceived {
  name: string;
  api_canvas_step_id: string;
  last_received: string;
}
