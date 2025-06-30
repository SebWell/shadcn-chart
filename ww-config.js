export default {
  editor: {
    label: {
      en: 'Chart',
      fr: 'Graphique'
    },
    icon: 'bar-chart'
  },
  triggerEvents: [
    {
      name: 'data-point-click',
      label: { en: 'On data point click', fr: 'Au clic sur point de données' },
      event: {
        point: {}
      }
    },
    {
      name: 'data-point-hover',
      label: { en: 'On data point hover', fr: 'Au survol de point de données' },
      event: {
        point: {}
      }
    }
  ],
  properties: {
    type: {
      label: { en: 'Chart type', fr: 'Type de graphique' },
      type: 'TextSelect',
      options: {
        options: [
          { value: 'line', label: { en: 'Line', fr: 'Ligne' } },
          { value: 'bar', label: { en: 'Bar', fr: 'Barres' } },
          { value: 'area', label: { en: 'Area', fr: 'Aire' } },
          { value: 'pie', label: { en: 'Pie', fr: 'Camembert' } }
        ]
      },
      defaultValue: 'line',
      bindable: true
    },
    title: {
      label: { en: 'Title', fr: 'Titre' },
      type: 'Text',
      bindable: true
    },
    description: {
      label: { en: 'Description', fr: 'Description' },
      type: 'Text',
      bindable: true
    },
    height: {
      label: { en: 'Height', fr: 'Hauteur' },
      type: 'TextSelect',
      options: {
        options: [
          { value: 'sm', label: { en: 'Small (192px)', fr: 'Petit (192px)' } },
          { value: 'md', label: { en: 'Medium (256px)', fr: 'Moyen (256px)' } },
          { value: 'lg', label: { en: 'Large (320px)', fr: 'Grand (320px)' } },
          { value: 'xl', label: { en: 'Extra Large (384px)', fr: 'Très grand (384px)' } }
        ]
      },
      defaultValue: 'md',
      bindable: true
    },
    data: {
      label: { en: 'Chart data', fr: 'Données du graphique' },
      type: 'Array',
      options: {
        item: {
          type: 'Object',
          options: {
            item: {
              name: {
                label: { en: 'Series name', fr: 'Nom de la série' },
                type: 'Text',
                bindable: true
              },
              color: {
                label: { en: 'Color', fr: 'Couleur' },
                type: 'Text',
                bindable: true
              },
              data: {
                label: { en: 'Data points', fr: 'Points de données' },
                type: 'Array',
                options: {
                  item: {
                    type: 'Object',
                    options: {
                      item: {
                        label: {
                          label: { en: 'Label', fr: 'Libellé' },
                          type: 'Text',
                          bindable: true
                        },
                        value: {
                          label: { en: 'Value', fr: 'Valeur' },
                          type: 'Number',
                          bindable: true
                        }
                      }
                    }
                  }
                },
                bindable: true
              }
            }
          }
        }
      },
      defaultValue: [
        {
          name: 'Series 1',
          color: '#3b82f6',
          data: [
            { label: 'Jan', value: 30 },
            { label: 'Feb', value: 45 },
            { label: 'Mar', value: 35 },
            { label: 'Apr', value: 60 },
            { label: 'May', value: 55 }
          ]
        }
      ],
      bindable: true
    },
    showGrid: {
      label: { en: 'Show grid', fr: 'Afficher la grille' },
      type: 'OnOff',
      defaultValue: true,
      bindable: true
    },
    showPoints: {
      label: { en: 'Show points', fr: 'Afficher les points' },
      type: 'OnOff',
      defaultValue: true,
      bindable: true
    },
    showLegend: {
      label: { en: 'Show legend', fr: 'Afficher la légende' },
      type: 'OnOff',
      defaultValue: true,
      bindable: true
    },
    strokeWidth: {
      label: { en: 'Line stroke width', fr: 'Épaisseur des lignes' },
      type: 'Number',
      defaultValue: 2,
      bindable: true
    },
    pointSize: {
      label: { en: 'Point size', fr: 'Taille des points' },
      type: 'Number',
      defaultValue: 3,
      bindable: true
    },
    loading: {
      label: { en: 'Loading state', fr: 'État de chargement' },
      type: 'OnOff',
      defaultValue: false,
      bindable: true
    },
    emptyText: {
      label: { en: 'Empty state text', fr: 'Texte d\'état vide' },
      type: 'Text',
      defaultValue: 'No data available',
      bindable: true
    },
    customClass: {
      label: { en: 'Custom CSS class', fr: 'Classe CSS personnalisée' },
      type: 'Text',
      bindable: true
    },
    customStyle: {
      label: { en: 'Custom style', fr: 'Style personnalisé' },
      type: 'Text',
      bindable: true
    }
  }
} 