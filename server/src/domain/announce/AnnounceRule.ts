import { Trump } from '../card/Trump';
import { Hands } from '../play/Hands';
import { Announces } from './Announces';

/** Option de table : jouer avec ou sans les annonces. */
export interface AnnounceRule {
  detect(hands: Hands, trump: Trump): Announces;
  isEnabled(): boolean;
}

class WithAnnounces implements AnnounceRule {
  detect(hands: Hands, trump: Trump): Announces {
    return Announces.detect(hands, trump);
  }

  isEnabled(): boolean {
    return true;
  }
}

class WithoutAnnounces implements AnnounceRule {
  detect(): Announces {
    return Announces.NONE;
  }

  isEnabled(): boolean {
    return false;
  }
}

export const AnnounceRules = {
  ENABLED: new WithAnnounces() as AnnounceRule,
  DISABLED: new WithoutAnnounces() as AnnounceRule,

  of(enabled: boolean): AnnounceRule {
    return enabled ? AnnounceRules.ENABLED : AnnounceRules.DISABLED;
  },
};
