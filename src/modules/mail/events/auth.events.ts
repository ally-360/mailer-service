export class ActivationLinkEvent {
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly activationLink: string,
  ) {}
}

export class ReqResetPasswordEvent {
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly resetLink: string,
  ) {}
}

export class WelcomeEvent {
  constructor(public readonly email: string) {}
}

export class PasswordResetSuccessEvent {
  constructor(public readonly name: string, public readonly email: string) {}
}

export class AccountDeactivated {
  constructor(public readonly name: string, public readonly email: string) {}
}
