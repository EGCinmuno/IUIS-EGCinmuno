import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

def crear_radar_vs_caso_real(row_tabla, paciente_dict, columnas_estadisticas, nombre_estadisticas=None, color_tabla='#1f77b4'):
    """
    Superpone el polígono de una tabla IUIS con los síntomas binarios (0 o 1) 
    de un paciente real usando puntos (Scatter) en lugar de un polígono deformado.
    """
    nombre_tabla = row_tabla['Nombre']
    datos_tabla = [row_tabla[col] for col in columnas_estadisticas]
    num_estadisticas = len(columnas_estadisticas)

    if nombre_estadisticas is None:
        nombre_estadisticas = columnas_estadisticas

    angulos = [n / float(num_estadisticas) * 2 * np.pi for n in range(num_estadisticas)]
    angulos_completo = angulos + angulos[:1]

    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))

    # 1. Procesar e invertir la tabla de fondo
    valores_float = [float(str(val).replace(',', '.')) if pd.notna(val) else np.nan for val in datos_tabla]
    max_valor = np.nanmax(valores_float)
    
    v_tabla_inv = [max_valor - val if pd.notna(val) else np.nan for val in valores_float]
    v_tabla_inv += v_tabla_inv[:1]

    # Dibujar perfil de la patología
    ax.plot(angulos_completo, v_tabla_inv, linewidth=2, color=color_tabla, label=nombre_tabla)
    ax.fill(angulos_completo, v_tabla_inv, color=color_tabla, alpha=0.25)

    # 2. PROCESAR EL PACIENTE REAL (Binario: 0 o 1)
    angulos_paciente = []
    valores_paciente_inv = []
    
    for idx, col in enumerate(columnas_estadisticas):
        presente = paciente_dict.get(col, 0) # 1 si lo tiene, 0 si no
        if presente == 1:
            # Si lo tiene, lo dibujamos en el extremo de máxima coincidencia (corresponde al valor invertido más alto)
            angulos_paciente.append(angulos[idx])
            valores_paciente_inv.append(0.0) # En tu escala invertida, 0.0 arriba/afuera significa 100% presente
            
    # Graficar los síntomas del paciente como "luces de alerta" rojas
    ax.scatter(angulos_paciente, valores_paciente_inv, color='red', s=120, 
               edgecolor='black', zorder=5, label='Síntomas Presentes en el Paciente')

    # Ajustes estéticos fijos de tu script anterior...
    ax.set_xticks(angulos)
    ax.set_xticklabels(nombre_estadisticas, size=10, fontweight='bold')
    
    # Inversión visual de límites radiales
    data_min = np.nanmin(valores_float)
    data_max = np.nanmax(valores_float)
    padding = (data_max - data_min) * 0.1
    ax.set_ylim(data_max + padding, max(0, data_min - padding))

    ax.legend(loc='lower center', bbox_to_anchor=(0.5, -0.15), ncol=1, frameon=True)
    plt.tight_layout()
    plt.show()



# Definís los síntomas reales detectados en la clínica para el paciente en estudio
paciente_lorenzo = {
    'LT': 0,
    'LB_Compromiso': 0,
    'Autoinmunidad': 1,       # El paciente tiene citopenias autoinmunes
    'Infecciones': 1,          # Presenta infecciones recurrentes
    'Broncopulmonares': 1,     # Tiene bronquiectasias
    'Dermatológicas': 1        # Presenta eczema severo
}

# Graficás al paciente contra la tabla que sospechás (ej: Enfermedades de Inmunodesregulación)
if __name__ == '__main__':
    df = pd.read_csv('./DB/Categorias_desglosed.csv')
    print(df.head())
    fila_tabla = df[df['Nombre'] == 'Table 4 Diseases of Immune Dysregulation'].iloc[0]
    crear_radar_vs_caso_real(fila_tabla, paciente_lorenzo, ["LT", "LB_Compromiso", "Autoinmunidad", "Infecciones", "Broncopulmonares", "Dermatológicas"])