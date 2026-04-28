// TransactionHistory.js
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';

const TransactionHistory = ({ address }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactionHistory = useCallback(async () => {
    if (!window.ethereum || !address) return;

    setLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      const stakedFilter = contract.filters.Staked(address);
      const withdrawnFilter = contract.filters.Withdrawn(address);

      const stakedEvents = await contract.queryFilter(stakedFilter);
      const withdrawnEvents = await contract.queryFilter(withdrawnFilter);

      const stakes = await Promise.all(
        stakedEvents.map(async (event) => {
          const block = await event.getBlock();

          return {
            type: 'Stake',
            amount: ethers.formatEther(event.args.amount),
            date: new Date(Number(block.timestamp) * 1000),
            txHash: event.transactionHash,
            blockNumber: event.blockNumber,
            stakeIndex: event.args.stakeIndex.toString(),
            lockUntil: new Date(Number(event.args.lockUntil) * 1000),
          };
        })
      );

      const withdrawals = await Promise.all(
        withdrawnEvents.map(async (event) => {
          const block = await event.getBlock();

          return {
            type: 'Withdraw',
            principal: ethers.formatEther(event.args.principal),
            reward: ethers.formatEther(event.args.reward),
            total: ethers.formatEther(event.args.total),
            date: new Date(Number(block.timestamp) * 1000),
            txHash: event.transactionHash,
            blockNumber: event.blockNumber,
            stakeIndex: event.args.stakeIndex.toString(),
          };
        })
      );

      const allTransactions = [...stakes, ...withdrawals].sort(
        (a, b) => b.date - a.date
      );

      setTransactions(allTransactions);
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchTransactionHistory();
    }
  }, [address, fetchTransactionHistory]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateHash = (hash) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  if (!address) {
    return (
      <div style={styles.container}>
        <p style={styles.emptyMessage}>Connect wallet to view history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Loading transaction history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>{error}</p>
        <button style={styles.retryButton} onClick={fetchTransactionHistory}>
          Retry
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div style={styles.container}>
        <p style={styles.emptyMessage}>No transactions yet</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Transaction History</h3>

        <button
          style={styles.refreshButton}
          onClick={fetchTransactionHistory}
        >
          Refresh
        </button>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Transaction</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index} style={styles.row}>
                <td style={styles.td}>
                  <span
                    style={
                      tx.type === 'Stake'
                        ? styles.typeStake
                        : styles.typeWithdraw
                    }
                  >
                    {tx.type}
                  </span>
                </td>

                <td style={styles.td}>
                  {tx.type === 'Stake' ? (
                    <span style={styles.amount}>
                      {tx.amount} ETH
                    </span>
                  ) : (
                    <div>
                      <span style={styles.amount}>
                        {tx.total} ETH
                      </span>

                      <br />

                      <span style={styles.reward}>
                        (Principal: {tx.principal} ETH + Reward:{' '}
                        {tx.reward} ETH)
                      </span>
                    </div>
                  )}
                </td>

                <td style={styles.td}>
                  <div style={styles.dateContainer}>
                    <div style={styles.date}>
                      {formatDate(tx.date)}
                    </div>

                    {tx.type === 'Stake' && (
                      <div style={styles.lockUntil}>
                        Lock until: {formatDate(tx.lockUntil)}
                      </div>
                    )}
                  </div>
                </td>

                <td style={styles.td}>
                  <div style={styles.txInfo}>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.link}
                    >
                      {truncateHash(tx.txHash)} [view]
                    </a>

                    <div style={styles.blockNumber}>
                      Block: {tx.blockNumber}
                    </div>
                  </div>
                </td>

                <td style={styles.td}>
                  <span style={styles.statusSuccess}>
                    Confirmed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Total Transactions:{' '}
          <strong>{transactions.length}</strong>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginTop: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '12px',
    flexWrap: 'wrap',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
  },
  refreshButton: {
    padding: '8px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
    cursor: 'pointer',
    fontSize: '14px',
  },
  loading: {
    textAlign: 'center',
    padding: '30px',
    color: '#6b7280',
  },
  error: {
    textAlign: 'center',
    color: '#dc2626',
    marginBottom: '12px',
  },
  retryButton: {
    display: 'block',
    margin: '0 auto',
    padding: '10px 18px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '30px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerRow: {
    backgroundColor: '#f9fafb',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    fontSize: '12px',
    textTransform: 'uppercase',
    color: '#6b7280',
    borderBottom: '1px solid #e5e7eb',
  },
  row: {
    borderBottom: '1px solid #f3f4f6',
  },
  td: {
    padding: '14px 12px',
    verticalAlign: 'top',
    fontSize: '14px',
    color: '#374151',
  },
  typeStake: {
    padding: '4px 10px',
    borderRadius: '20px',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '12px',
    fontWeight: '600',
  },
  typeWithdraw: {
    padding: '4px 10px',
    borderRadius: '20px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    fontSize: '12px',
    fontWeight: '600',
  },
  amount: {
    fontWeight: '700',
    color: '#111827',
  },
  reward: {
    fontSize: '12px',
    color: '#10b981',
  },
  dateContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  date: {
    color: '#374151',
  },
  lockUntil: {
    fontSize: '11px',
    color: '#6b7280',
  },
  txInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '600',
  },
  blockNumber: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  statusSuccess: {
    padding: '4px 10px',
    borderRadius: '20px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    fontSize: '12px',
    fontWeight: '600',
  },
  footer: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #f3f4f6',
    textAlign: 'center',
  },
  footerText: {
    margin: 0,
    color: '#6b7280',
    fontSize: '14px',
  },
};

export default TransactionHistory;