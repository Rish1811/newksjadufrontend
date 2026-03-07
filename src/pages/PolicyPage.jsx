import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API_BASE from '../config';

const PolicyPage = () => {
    const { type } = useParams();
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/policies/${type}`);
                if (response.ok) {
                    const data = await response.json();
                    setPolicy(data);
                } else {
                    setPolicy({ title: 'Not found', content: 'Policy content is not available.' });
                }
            } catch (error) {
                console.error('Error fetching policy:', error);
                setPolicy({ title: 'Error', content: 'There was an error loading the policy.' });
            } finally {
                setLoading(false);
            }
        };

        fetchPolicy();
    }, [type]);

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '100px auto 4rem', padding: '0 2rem' }}>
            <h1 style={{ color: 'RGB(0,0,128)', marginBottom: '2rem' }}>{policy?.title}</h1>
            <div
                style={{ lineHeight: '1.8', color: '#000', fontSize: '1.05rem' }}
                dangerouslySetInnerHTML={{
                    __html: policy?.content
                        ?.split('\n')
                        .map(line => {
                            // If line is all uppercase and not empty, wrap it in bold
                            if (line.length > 3 && line === line.toUpperCase()) {
                                return `<strong>${line}</strong>`;
                            }
                            return line;
                        })
                        .join('<br/>')
                }}
            />
        </div>
    );
};

export default PolicyPage;
