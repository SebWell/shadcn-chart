export default {
    editor: {
        label: {
            en: 'Chart',
            fr: 'Graphique'
        },
        icon: 'bar_chart',
    },
    triggerEvents: [
        { name: 'trigger-event', label: { en: 'On data point click', fr: 'Sur clic point données' }, event: { domEvent: '', value: '' }, default: true },
    ],
    properties: {
        content: {
            label: {
                en: 'Chart content',
                fr: 'Contenu graphique'
            },
            type: 'Object',
            section: 'content',
            bindable: true,
            defaultValue: {
                type: 'line',
                title: 'Sample Chart',
                description: 'Chart description',
                data: [
                    {
                        name: 'Series 1',
                        color: 'hsl(220, 70%, 50%)',
                        data: [
                            { label: 'Jan', value: 10 },
                            { label: 'Feb', value: 20 },
                            { label: 'Mar', value: 15 },
                            { label: 'Apr', value: 25 },
                            { label: 'May', value: 30 }
                        ]
                    }
                ],
                height: 'md',
                showGrid: true,
                showLegend: true,
                showPoints: true,
                strokeWidth: 2,
                pointSize: 3,
                loading: false,
                emptyText: 'No data available'
            },
            options: {
                item: {
                    type: {
                        label: {
                            en: 'Chart type',
                            fr: 'Type de graphique'
                        },
                        type: 'TextSelect',
                        options: {
                            options: [
                                { value: 'line', label: 'Line' },
                                { value: 'bar', label: 'Bar' },
                                { value: 'area', label: 'Area' },
                                { value: 'pie', label: 'Pie' }
                            ]
                        },
                        section: 'content'
                    },
                    title: {
                        label: {
                            en: 'Title',
                            fr: 'Titre'
                        },
                        type: 'Text',
                        section: 'content',
                        bindable: true
                    },
                    description: {
                        label: {
                            en: 'Description',
                            fr: 'Description'
                        },
                        type: 'LongText',
                        section: 'content',
                        bindable: true
                    },
                    data: {
                        label: {
                            en: 'Chart data',
                            fr: 'Données graphique'
                        },
                        type: 'Array',
                        section: 'content',
                        bindable: true,
                        options: {
                            item: {
                                type: 'Object',
                                options: {
                                    item: {
                                        name: {
                                            label: { en: 'Series name', fr: 'Nom série' },
                                            type: 'Text'
                                        },
                                        color: {
                                            label: { en: 'Color', fr: 'Couleur' },
                                            type: 'Color'
                                        },
                                        data: {
                                            label: { en: 'Data points', fr: 'Points données' },
                                            type: 'Array',
                                            options: {
                                                item: {
                                                    type: 'Object',
                                                    options: {
                                                        item: {
                                                            label: {
                                                                label: { en: 'Label', fr: 'Libellé' },
                                                                type: 'Text'
                                                            },
                                                            value: {
                                                                label: { en: 'Value', fr: 'Valeur' },
                                                                type: 'Number'
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    height: {
                        label: {
                            en: 'Height',
                            fr: 'Hauteur'
                        },
                        type: 'TextSelect',
                        section: 'style',
                        options: {
                            options: [
                                { value: 'sm', label: 'Small' },
                                { value: 'md', label: 'Medium' },
                                { value: 'lg', label: 'Large' },
                                { value: 'xl', label: 'Extra Large' }
                            ]
                        },
                        bindable: true
                    },
                    showGrid: {
                        label: {
                            en: 'Show grid',
                            fr: 'Afficher grille'
                        },
                        type: 'OnOff',
                        section: 'style',
                        bindable: true
                    },
                    showLegend: {
                        label: {
                            en: 'Show legend',
                            fr: 'Afficher légende'
                        },
                        type: 'OnOff',
                        section: 'style',
                        bindable: true
                    },
                    showPoints: {
                        label: {
                            en: 'Show points',
                            fr: 'Afficher points'
                        },
                        type: 'OnOff',
                        section: 'style',
                        bindable: true
                    },
                    loading: {
                        label: {
                            en: 'Loading state',
                            fr: 'État chargement'
                        },
                        type: 'OnOff',
                        section: 'settings',
                        bindable: true
                    }
                }
            }
        }
    }
};