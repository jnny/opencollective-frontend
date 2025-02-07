import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { Box, Flex } from '@rebass/grid';
import { truncate } from 'lodash';

import { formatCurrency } from '../../../lib/utils';
import Link from '../../Link';
import { P, Span } from '../../Text';
import FormattedMoneyAmount from '../../FormattedMoneyAmount';
import StyledProgressBar from '../../StyledProgressBar';

import { ContributionTypes } from '../_constants';
import Contribute from './Contribute';

const messages = defineMessages({
  fallbackDescription: {
    id: 'TierCard.DefaultDescription',
    defaultMessage:
      '{tierName, select, backer {Become a backer} sponsor {Become a sponsor} other {Join us}} {minAmount, select, 0 {} other {for {minAmountWithCurrency} {interval, select, month {per month} year {per year} other {}}}} and help us sustain our activities!',
  },
});

const getContributionTypeFromTier = tier => {
  if (tier.goal) {
    return ContributionTypes.FINANCIAL_GOAL;
  } else if (tier.interval) {
    return ContributionTypes.FINANCIAL_RECURRING;
  } else {
    return ContributionTypes.FINANCIAL_ONE_TIME;
  }
};

const ContributeTier = ({ intl, collective, tier }) => {
  const currency = tier.currency || collective.currency;
  const minAmount = tier.amountType === 'FLEXIBLE' ? tier.minAmount : tier.amount;
  const raised = tier.interval ? tier.stats.totalRecurringDonations : tier.stats.totalDonated;

  let description;
  if (tier.description) {
    description = truncate(tier.description, { length: tier.hasLongDescription ? 60 : 256 });
  } else {
    description = intl.formatMessage(messages.fallbackDescription, {
      minAmount,
      tierName: tier.name,
      minAmountWithCurrency: minAmount && formatCurrency(minAmount, currency),
      interval: tier.interval,
    });
  }

  return (
    <Contribute
      route="orderCollectiveTierNew"
      routeParams={{ collectiveSlug: collective.slug, verb: 'contribute', tierSlug: tier.slug, tierId: tier.id }}
      title={tier.name}
      type={getContributionTypeFromTier(tier)}
      buttonText={tier.button}
      contributors={tier.contributors}
      stats={tier.stats.contributors}
    >
      <Flex flexDirection="column" justifyContent="space-between" height="100%">
        <div>
          {tier.goal && (
            <Box mb={3}>
              <P fontSize="Paragraph" color="black.600" mb={2}>
                <FormattedMessage
                  id="TierPage.AmountGoal"
                  defaultMessage="{amountWithInterval} goal"
                  values={{
                    amountWithInterval: (
                      <FormattedMoneyAmount
                        amount={tier.goal}
                        interval={tier.interval}
                        currency={currency}
                        amountStyles={{ fontWeight: 'bold', fontSize: 'H5', color: 'black.900' }}
                      />
                    ),
                  }}
                />
              </P>
              <P fontSize="Caption" color="black.500">
                <FormattedMessage
                  id="TierPage.AmountRaised"
                  defaultMessage="{amountWithInterval} raised"
                  values={{
                    amountWithInterval: (
                      <FormattedMoneyAmount
                        amountStyles={{ fontWeight: 'bold' }}
                        amount={raised}
                        currency={currency}
                        interval={tier.interval}
                      />
                    ),
                  }}
                />
                {tier.goal && ` (${Math.round((raised / tier.goal) * 100)}%)`}
              </P>
              <Box mt={1}>
                <StyledProgressBar percentage={raised / tier.goal} />
              </Box>
            </Box>
          )}
          <P mb={4} mt={2}>
            {description}{' '}
            {tier.hasLongDescription && (
              <Link
                route="tier"
                params={{
                  collectiveSlug: collective.slug,
                  verb: 'contribute',
                  tierSlug: tier.slug,
                  tierId: tier.id,
                }}
              >
                <Span textTransform="capitalize" whiteSpace="nowrap">
                  <FormattedMessage id="ContributeCard.ReadMore" defaultMessage="Read more" />
                </Span>
              </Link>
            )}
          </P>
        </div>
        {minAmount && (
          <div>
            <P fontSize="Tiny" color="black.600" textTransform="uppercase" mb={1}>
              <FormattedMessage id="ContributeTier.StartsAt" defaultMessage="Starts at" />
            </P>
            <P color="black.700">
              <FormattedMoneyAmount
                amount={minAmount}
                interval={tier.interval}
                currency={currency}
                amountStyles={{ fontSize: 'H5', fontWeight: 'bold', color: 'black.900' }}
              />
            </P>
          </div>
        )}
      </Flex>
    </Contribute>
  );
};

ContributeTier.propTypes = {
  collective: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    currency: PropTypes.string.isRequired,
  }),
  tier: PropTypes.shape({
    id: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    currency: PropTypes.string,
    hasLongDescription: PropTypes.bool,
    interval: PropTypes.string,
    amountType: PropTypes.string,
    button: PropTypes.string,
    goal: PropTypes.number,
    minAmount: PropTypes.number,
    amount: PropTypes.number,
    stats: PropTypes.shape({
      totalRecurringDonations: PropTypes.number,
      totalDonated: PropTypes.number,
      contributors: PropTypes.object,
    }).isRequired,
    contributors: PropTypes.arrayOf(PropTypes.object),
  }),
  /** @ignore */
  intl: PropTypes.object.isRequired,
};

export default injectIntl(ContributeTier);
