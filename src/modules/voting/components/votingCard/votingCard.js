/* eslint-disable no-console */
(function () {
    'use strict';

    const controller = function (Base, $scope, modalManager, votingService) {

        class VotingCard extends Base {

            pollData = {}
            currentHeight = 0
            balance = 0

            relativeElapsedTime = 0.0
            blocksLeft = 0
            hasVotes = false
            isClosed = true
            isEligible = true
            votes = []
            totalVotes = 0

            constructor() {
                super($scope);
            }

            $onChanges() {
                const height = this.currentHeight;
                this.relativeElapsedTime = Math.min(height / this.pollData.end, 1.0);
                this.blocksLeft = Math.max(0, this.pollData.end - height);
                this.isClosed = this.relativeElapsedTime >= 1;
                this.votes = VotingCard._getCurrentVotesAsNormalized(this.pollData);
                this.totalVotes = this.votes.reduce((acc, { v }) => acc + v, 0);
                this.hasVotes = this.totalVotes > 0;
                // TODO: eligibility not implemented yet
                this.isEligible = votingService.isEligible();
            }

            vote() {
                modalManager.showVoteModal(this.pollData);
            }

            static _getCurrentVotesAsNormalized(pollData) {

                const Colors = [
                    '#a4ec9b',
                    '#5a81ea',
                    '#a6c1b7',
                    '#e36569',
                    '#008b55',
                    '#efa141'
                    // ... add more if needed
                ];

                const { options } = pollData;
                const mappedOptions = Object.keys(options).map(k => options[k]);
                const totalVotes = mappedOptions.reduce((acc, o) => acc + o.votes, 0);
                return mappedOptions.reduce((acc, opt, i) => {
                    const prev = acc[i - 1];
                    acc.push({
                        c: Colors[i % (Colors.length - 1)],
                        l: opt.label,
                        x: prev ? prev.x + prev.w : 0,
                        w: opt.votes / totalVotes,
                        v: opt.votes
                    });
                    return acc;
                }, []);

            }

        }

        return new VotingCard();
    };

    controller.$inject = ['Base', '$scope', 'modalManager', 'votingService'];

    angular.module('app.voting').component('wVotingCard', {
        bindings: {
            pollData: '<',
            currentHeight: '<',
            accountId: '<',
            balance: '<'
        },
        templateUrl: 'modules/voting/components/votingCard/votingCard.html',
        controller
    });
})();